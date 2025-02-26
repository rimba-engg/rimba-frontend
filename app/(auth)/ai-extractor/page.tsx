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

import DocumentTypeModal from './DocumentTypeModal';
import DocumentUploadModal from './DocumentUploadModal';

interface ExtractionConfig {
  name: string;
  question: string;
  undefined: string;
}

export interface ExtractionLogic {
  id: string;
  name: string;
  batch_size: number;
  config: ExtractionConfig[];
  last_updated_at: string;
  last_updated_by: string | null;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  code: string;
  extraction_logic: ExtractionLogic | null;
}

interface ApiResponse {
  status: string;
  message: string;
  data: DocumentType[];
}

function ExtractionLogicModal({
  isOpen,
  onClose,
  docType,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  docType: DocumentType;
  onSave: (updatedLogic: ExtractionLogic) => void;
}) {
  const initialLogic = docType.extraction_logic!;
  const [editedLogic, setEditedLogic] = useState<ExtractionLogic>(initialLogic);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (
    index: number,
    key: 'name' | 'question',
    value: string
  ) => {
    const newConfig = [...editedLogic.config];
    newConfig[index] = { ...newConfig[index], [key]: value };
    setEditedLogic({ ...editedLogic, config: newConfig });
  };

  const handleAddField = () => {
    setEditedLogic({
      ...editedLogic,
      config: [
        ...editedLogic.config,
        { name: '', question: '', undefined: '' },
      ],
    });
  };

  const handleRemoveField = (index: number) => {
    setEditedLogic({
      ...editedLogic,
      config: editedLogic.config.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving extraction logic:', editedLogic);
      onSave(editedLogic);
      onClose();
    } catch (error) {
      console.error('Error saving extraction logic:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Edit Extraction Logic</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="logic-name">Logic Name</Label>
              <Input
                id="logic-name"
                value={editedLogic.name}
                disabled
                className="bg-muted"
              />
            </div>
            <div className='hidden'>
              <Label htmlFor="batch-size">Batch Size</Label>
              <Input
                type="number"
                id="batch-size"
                value={editedLogic.batch_size}
                onChange={(e) =>
                  setEditedLogic({
                    ...editedLogic,
                    batch_size: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Extraction Fields</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddField}
                className="text-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {editedLogic.config.map((field, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-muted/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label>Field Name</Label>
                        <Input
                          value={field.name}
                          onChange={(e) =>
                            handleFieldChange(index, 'name', e.target.value)
                          }
                          placeholder="Enter field name"
                        />
                      </div>
                      <div>
                        <Label>Extraction Question</Label>
                        <Textarea
                          value={field.question}
                          onChange={(e) =>
                            handleFieldChange(index, 'question', e.target.value)
                          }
                          placeholder="Enter the question to extract this field"
                          className="h-24"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const handleSaveExtractionLogic = async (docTypeId: string, updatedLogic: ExtractionLogic) => {
    console.log('Saving extraction logic for docTypeId', docTypeId, updatedLogic);
    try {
      const response = await api.put<ApiResponse>(
        '/v2/extractor/logic/list/',
        {
          extraction_logic_id: updatedLogic.id,
          config: updatedLogic.config.map(({ name, question, undefined }) => ({
            name,
            question,
            undefined: undefined || ''
          }))
        }
      );

      if (response.status === 'success') {
        setDocumentTypes(prev =>
          prev.map(dt =>
            dt.id === docTypeId
              ? { ...dt, extraction_logic: updatedLogic }
              : dt
          )
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error saving extraction logic:', error);
      // You might want to add error handling/notification here
    }
  };

  const handleCreateExtractionLogic = async (docType: DocumentType) => {
    try {
      const response = await api.post<ApiResponse>('/v2/extractor/logic/list/', {
        name: `${docType.name} Logic`,
        document_type: docType.id,
        config: [],
        batch_size: 1
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
        description: updatedDocType.description || ''
      });

      if (response.status === 'success') {
        setDocumentTypes(prev =>
          prev.map(dt =>
            dt.id === updatedDocType.id ? updatedDocType : dt
          )
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
      setError("Name is required");
      return;
    }
    try {
      const response = await api.post<ApiResponse>('/v2/document-types/', {
        name: newDocType.name,
        description: newDocType.description || ''
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
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowCreateDocTypeModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Document Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType) => (
          <div
            key={docType.id}
            className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
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
          docType={documentTypes.find(dt => dt.id === showExtractionModal)!}
          onSave={(updatedLogic) => {
            handleSaveExtractionLogic(showExtractionModal, updatedLogic);
          }}
        />
      )}

      {showDocTypeModal && (
        <DocumentTypeModal
          isOpen={true}
          onClose={() => setShowDocTypeModal(null)}
          docType={documentTypes.find(dt => dt.id === showDocTypeModal)!}
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
          docType={documentTypes.find(dt => dt.id === showDocUploadModal)!}
          onUpload={(uploadedFile, docType) => {
            console.log('Uploaded file:', uploadedFile, 'for document type:', docType);
            // Optionally, you can add further logic here (like refreshing a document list)
          }}
        />
      )}
    </div>
  );
}