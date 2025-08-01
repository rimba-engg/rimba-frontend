'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, Eye, Link as LinkIcon } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api,BASE_URL, defaultHeaders } from '@/lib/api';
import { getStoredCustomer } from '@/lib/auth';

import { AgGridReact } from 'ag-grid-react';
import { AllEnterpriseModule, LicenseManager } from "ag-grid-enterprise";
import { provideGlobalGridOptions, themeQuartz } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

// Register all community features
ModuleRegistry.registerModules([
  AllEnterpriseModule,
]);
LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY || '');
provideGlobalGridOptions({ theme: themeQuartz, sideBar: {toolPanels: ['columns', 'filters'], hiddenByDefault: true}, suppressContextMenu: false});


interface Document {
  id: string;
  name: string;
  uploadDate: string;
  type: string;
  status: 'pending' | 'extracted' | 'reconciled' | 'flagged' | 'review';
  uploadedBy: string;
}

interface DocumentResponse {
  status: string;
  message: string;
  data: {
    documents: Document[];
  };
}

const fetchDocuments = async (): Promise<Document[]> => {
  try {
    const response = await api.get<DocumentResponse>('/v2/documents/');
    const data = response;
    console.log(data);
    if (data.status === 'success') {
      return data.data.documents.map((doc: any) => ({
        id: doc._id,
        name: doc.name,
        uploadDate: doc.last_updated_at,
        type: doc.document_type,
        status: doc.status.toLowerCase(),
        uploadedBy: doc.last_uploaded_by,
      }));
    } else {
      console.error('Failed to fetch documents:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

const DocumentNameRenderer = (props: any) => (
  <div className="flex items-center gap-2">
    <FileText className="w-4 h-4 text-muted-foreground" />
    <span>{props.value}</span>
  </div>
);

// Color palette for type pills
const typeColors = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
  "bg-gray-100 text-gray-800",
];

function getTypeColor(type: string) {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
  return typeColors[Math.abs(hash) % typeColors.length];
}

const TypePillRenderer = (props: any) => (
  <span className={`px-2 py-1 rounded text-sm ${getTypeColor(props.value)}`}>{props.value}</span>
);

const StatusPillRenderer = (props: any) => {
  const status = props.value;
  let color = '';
  switch (status) {
    case 'reconciled':
      color = 'bg-green-100 text-green-800'; break;
    case 'pending':
      color = 'bg-yellow-100 text-yellow-800'; break;
    case 'extracted':
      color = 'bg-blue-100 text-blue-800'; break;
    case 'flagged':
      color = 'bg-orange-100 text-orange-800'; break;
    case 'review':
      color = 'bg-red-100 text-red-800'; break;
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ActionButtonsRenderer = (props: any) => {
  const { data, context } = props;
  const deleting = context.deletingDocumentId === data.id;
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        className="text-primary hover:text-primary/80"
        onClick={e => {
          e.stopPropagation();
          context.handleOpen(data.id);
        }}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-primary"
        onClick={e => {
          e.stopPropagation();
          context.handleCopyUrl(data.id);
        }}
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        className="text-red-500 hover:text-red-600"
        onClick={e => {
          e.stopPropagation();
          context.handleDelete(data.id);
        }}
        disabled={deleting}
      >
        {deleting ? (
          <div className="flex items-center gap-2">
            <div className="spinner"></div>
            Deleting...
          </div>
        ) : <Trash2 className="w-4 h-4" />}
      </Button>
    </div>
  );
};


export default function DocumentsPage() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const customer = getStoredCustomer();
    console.log(customer);
    loadDocuments();
  }, []);

  const handleDelete = async (documentId: string) => {
    console.log('Deleting document ID:', documentId);
    try {
      setDeletingDocumentId(documentId);
      console.log('Deleting document ID:', documentId);
      console.log(documentId);
      const response = await api.post('/v2/document/delete/', {
        document_id: documentId
      });

      if ((response as any).status === 'success') {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleOpen = (documentId: string) => {
    router.push(`/library/document?document_id=${documentId}`);
  };

  const handleCopyUrl = async (documentId: string) => {
    const url = `${window.location.origin}/library/document?document_id=${documentId}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast('URL copied to clipboard');
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast('Failed to copy URL');
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
      }
      formData.append('current_month', new Date().getMonth().toString());
      const uploadHeaders = { ...defaultHeaders } as Record<string, string>;
      // For multipart/form-data, we should remove the Content-Type
      // and let the browser set it with the correct boundary
      delete uploadHeaders['Content-Type'];

      const response = await fetch(`${BASE_URL}/v2/document/upload/`, {
        method: 'POST',
        body: formData,
        headers: uploadHeaders,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log(data);
      alert('Upload successful');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
      setShowUploadModal(false);
    }
  };

  const columnDefs = [
    {
      headerName: 'Document Name',
      field: 'name' as keyof Document,
      cellRenderer: DocumentNameRenderer,
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Upload Date',
      field: 'uploadDate' as keyof Document,
      valueFormatter: (params: any) => new Date(params.value).toLocaleDateString(),
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Type',
      field: 'type' as keyof Document,
      cellRenderer: TypePillRenderer,
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Status',
      field: 'status' as keyof Document,
      cellRenderer: StatusPillRenderer,
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Action',
      field: 'id' as keyof Document,
      cellRenderer: ActionButtonsRenderer,
      flex: 1,
      sortable: false,
      filter: false,
    },
  ];

  return (
    <div className="space-y-1">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow z-50 animate-fade-in">
          {toast}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="spinner"></div>
          <span className="ml-2">Loading documents...</span>
        </div>
      )}
      <div className="bg-card rounded-lg shadow">
        <div className="ag-theme-alpine" style={{ width: '100%', height: 500 }}>
          <AgGridReact
            rowData={documents}
            columnDefs={columnDefs}
            context={{ handleDelete, handleOpen, handleCopyUrl, deletingDocumentId }}
            rowNumbers={true}
            // onRowClicked={params => params.data && handleRowClick(params.data.id)}
            overlayLoadingTemplate={`<div class='flex justify-center items-center py-4'><div class='spinner'></div><span class='ml-2'>Loading documents...</span></div>`}
            loadingOverlayComponentParams={{ loading: loading }}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={20}
            rowClassRules={{
              'bg-red-50 hover:bg-red-100/80': params => params.data ? params.data.status === 'review' : false,
              'hover:bg-muted/50': params => params.data ? params.data.status !== 'review' : false,
            }}
          />
        </div>
      </div>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-2">
                  {selectedFiles.length > 0 ? selectedFiles.map(file => file.name).join(', ') : 'Drag and drop your files here, or click to browse'}
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setSelectedFiles(files);
                    setFiles(files);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Browse Files
                </Button>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedFiles.map((file, index) => (
        <div key={index}>
          <p>{file.name}</p>
        </div>
      ))}
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #4f46e5; /* Primary color */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}