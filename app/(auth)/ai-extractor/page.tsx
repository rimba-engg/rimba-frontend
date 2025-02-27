'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  FileText,
  Upload,
  Settings,
  ChevronRight,
  Trash2,
  Edit2,
  MoreVertical,
  Grid,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import DocumentTypeModal from './components/DocumentTypeModal';
import DocumentUploadModal from './components/DocumentUploadModal';
import { DocumentType, ExtractionLogic, ExtractionConfig, ApiResponse } from './types';
import { ExtractionLogicModal } from './components/ExtractionLogicModal';

export default function AIExtractorPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExtractionModal, setShowExtractionModal] = useState<string | null>(null);
  const [showDocTypeModal, setShowDocTypeModal] = useState<string | null>(null);
  const [showCreateDocTypeModal, setShowCreateDocTypeModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState<string | null>(null);

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>('/v2/extractor/logic/list/');
      if (response.status === 'success') {
        setDocumentTypes(response.data);
        setError(null);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError('Failed to load document types');
      console.error('Error fetching document types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExtractionLogic = async (
    docTypeId: string,
    updatedLogic: ExtractionLogic
  ) => {
    console.log('Saving extraction logic for docTypeId', docTypeId, updatedLogic);
    try {
      const response = await api.put<ApiResponse>('/v2/extractor/logic/list/', {
        extraction_logic_id: updatedLogic.id,
        config: updatedLogic.config.map(
          ({ name, question, "undefined": undef }) => ({
            name,
            question,
            "undefined": undef || '',
          })
        ),
      });

      if (response.status === 'success') {
        setDocumentTypes((prev) =>
          prev.map((dt) =>
            dt.id === docTypeId ? { ...dt, extraction_logic: updatedLogic } : dt
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error saving extraction logic:', error);
      // Add error handling/notification as needed.
    }
  };

  const handleCreateExtractionLogic = async (docType: DocumentType) => {
    try {
      const response = await api.post<ApiResponse>('/v2/extractor/logic/list/', {
        name: `${docType.name} Logic`,
        document_type: docType.id,
        config: [],
        batch_size: 1,
      });

      if (response.status === 'success') {
        await fetchDocumentTypes(); // Refresh the list
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating extraction logic:', error);
      setError('Failed to create extraction logic');
    }
  };

  const handleSaveDocumentType = async (updatedDocType: DocumentType) => {
    try {
      const response = await api.put<ApiResponse>('/v2/document-types/', {
        id: updatedDocType.id,
        name: updatedDocType.name,
        description: updatedDocType.description || '',
      });

      if (response.status === 'success') {
        setDocumentTypes((prev) =>
          prev.map((dt) => (dt.id === updatedDocType.id ? updatedDocType : dt))
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error saving document type:', error);
      setError('Failed to save document type');
    }
  };

  const handleCreateDocumentType = async (newDocType: DocumentType) => {
    if (!newDocType.name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      const response = await api.post<ApiResponse>('/v2/document-types/', {
        name: newDocType.name,
        description: newDocType.description || '',
      });

      if (response.status === 'success') {
        await fetchDocumentTypes();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating document type:', error);
      setError('Failed to create document type');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading document types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Extractor</h1>
          <p className="text-muted-foreground mt-2">
            Configure document types and extraction rules for automated data
            processing.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCreateDocTypeModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType) => (
          <div key={docType.id} className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {docType.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {docType.description || 'No description available'}
                  </p>
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {docType.code}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {docType.extraction_logic && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowExtractionModal(docType.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDocTypeModal(docType.id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDocUploadModal(docType.id)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {docType.extraction_logic ? (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <span>Logic: {docType.extraction_logic.name}</span>
                    <span className="ml-2">
                      Batch Size: {docType.extraction_logic.batch_size}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground mb-2">No extraction logic configured</p>
                  <Button
                    variant="outline"
                    className="text-primary hover:bg-primary/10"
                    onClick={() => handleCreateExtractionLogic(docType)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Extraction Logic
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showExtractionModal && (
        <ExtractionLogicModal
          isOpen={true}
          onClose={() => setShowExtractionModal(null)}
          docType={documentTypes.find((dt) => dt.id === showExtractionModal)!}
          onSave={(updatedLogic) => {
            handleSaveExtractionLogic(showExtractionModal, updatedLogic);
          }}
        />
      )}

      {showDocTypeModal && (
        <DocumentTypeModal
          isOpen={true}
          onClose={() => setShowDocTypeModal(null)}
          docType={documentTypes.find((dt) => dt.id === showDocTypeModal)!}
          onSave={handleSaveDocumentType}
        />
      )}

      {showCreateDocTypeModal && (
        <DocumentTypeModal
          isOpen={true}
          onClose={() => setShowCreateDocTypeModal(false)}
          docType={{ id: '', name: '', description: '', code: '', extraction_logic: null }}
          onSave={handleCreateDocumentType}
        />
      )}

      {showDocUploadModal && (
        <DocumentUploadModal
          isOpen={true}
          onClose={() => setShowDocUploadModal(null)}
          docType={documentTypes.find((dt) => dt.id === showDocUploadModal)!}
          onUpload={(uploadedFile, docType) => {
            console.log('Uploaded file:', uploadedFile, 'for document type:', docType);
            // Additional logic can be added here (e.g. to refresh a list)
          }}
        />
      )}
    </div>
  );
}