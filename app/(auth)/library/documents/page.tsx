'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  name: string;
  uploadDate: string;
  type: string;
  status: 'pending' | 'extracted' | 'reconciled' | 'flagged' | 'review';
}

// Mock API function
const fetchDocuments = async (): Promise<Document[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Q4 2023 LCFS Report.pdf',
      uploadDate: '2024-03-15',
      type: 'Compliance Report',
      status: 'reconciled',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Equipment Maintenance Log.xlsx',
      uploadDate: '2024-03-14',
      type: 'Maintenance Record',
      status: 'pending',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Safety Inspection Results.pdf',
      uploadDate: '2024-03-12',
      type: 'Audit Report',
      status: 'review',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174003',
      name: 'Environmental Impact Assessment.docx',
      uploadDate: '2024-03-10',
      type: 'Assessment Report',
      status: 'flagged',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174004',
      name: 'Training Certificates.zip',
      uploadDate: '2024-03-08',
      type: 'Certification',
      status: 'extracted',
    },
  ];
};

export default function DocumentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Manage and organize your compliance documents and reports.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline" className="ml-4">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Document Name</th>
                  <th className="text-left py-3 px-4">Upload Date</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  Drag and drop your files here, or click to browse
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
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
                <Button>Upload</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}