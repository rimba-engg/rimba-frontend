'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api,BASE_URL, defaultHeaders } from '@/lib/api';
import { getStoredCustomer } from '@/lib/auth';


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


export default function DocumentsPage() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'reconciled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'extracted':
        return 'bg-blue-100 text-blue-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      case 'review':
        return 'bg-red-100 text-red-800';
    }
  };

  const getRowStyle = (status: Document['status']) => {
    if (status === 'review') {
      return 'bg-red-50 hover:bg-red-100/80';
    }
    return 'hover:bg-muted/50';
  };

  const handleRowClick = (documentId: string) => {
    router.push(`/library/document?document_id=${documentId}`);
  };

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

  return (
    <div className="space-y-6">
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

      <div className="bg-card rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Document Name</th>
                <th className="text-left py-3 px-4">Upload Date</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <div className="spinner"></div>
                      <span className="ml-2">Loading documents...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted-foreground">
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`border-b last:border-b-0 cursor-pointer transition-colors ${getRowStyle(doc.status)}`}
                    onClick={() => handleRowClick(doc.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-muted px-2 py-1 rounded text-sm">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="destructive"
                        className="bg-red-300 text-white hover:bg-red-600 disabled:bg-red-500/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                        disabled={deletingDocumentId === doc.id}
                      >
                        {deletingDocumentId === doc.id ? (
                          <div className="flex items-center gap-2">
                            <div className="spinner"></div>
                            Deleting...
                          </div>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
      `}</style>
    </div>
  );
}