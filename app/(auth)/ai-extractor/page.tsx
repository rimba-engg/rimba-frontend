'use client';

import { useState } from 'react';
import { Plus, X, FileText, Upload, Settings, ChevronRight, Trash2, Edit2, MoreVertical, Grid } from 'lucide-react';
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

interface DocumentType {
  id: number;
  name: string;
  description: string;
  sampleDocuments: File[];
  fields: ExtractionField[];
  settings: DocumentSettings;
}

interface DocumentSettings {
  confidenceThreshold: number;
  autoValidation: boolean;
  notifyOnExtraction: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

interface ExtractionField {
  id: number;
  name: string;
  description: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  options?: string[];
  validation?: string;
  required: boolean;
  defaultValue?: string;
}

const defaultSettings: DocumentSettings = {
  confidenceThreshold: 0.8,
  autoValidation: true,
  notifyOnExtraction: true,
  retryOnFailure: true,
  maxRetries: 3,
};

const initialDocumentTypes: DocumentType[] = [
  {
    id: 1,
    name: 'Invoice',
    description: 'Standard supplier invoices for raw material purchases',
    sampleDocuments: [],
    settings: defaultSettings,
    fields: [
      { id: 1, name: 'invoiceNumber', description: 'Unique invoice identifier', type: 'text', required: true },
      { id: 2, name: 'amount', description: 'Total invoice amount', type: 'number', required: true },
      { id: 3, name: 'status', description: 'Payment status', type: 'select', options: ['Paid', 'Pending', 'Overdue'], required: true },
    ],
  },
  {
    id: 2,
    name: 'Bill of Lading',
    description: 'Transportation documents for shipment tracking',
    sampleDocuments: [],
    settings: defaultSettings,
    fields: [
      { id: 1, name: 'bolNumber', description: 'Bill of Lading number', type: 'text', required: true },
      { id: 2, name: 'shipmentDate', description: 'Date of shipment', type: 'date', required: true },
      { id: 3, name: 'quantity', description: 'Shipment quantity', type: 'number', required: true },
    ],
  },
];

export default function AIExtractorPage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [selectedField, setSelectedField] = useState<ExtractionField | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [showDeleteFieldModal, setShowDeleteFieldModal] = useState<{typeId: number; fieldId: number} | null>(null);
  const [newDocumentType, setNewDocumentType] = useState<Omit<DocumentType, 'id' | 'fields' | 'sampleDocuments' | 'settings'>>({
    name: '',
    description: '',
  });
  const [newField, setNewField] = useState<Omit<ExtractionField, 'id'>>({
    name: '',
    description: '',
    type: 'text',
    options: [],
    required: false,
  });

  const handleAddDocumentType = () => {
    const newType: DocumentType = {
      id: Math.max(...documentTypes.map(d => d.id), 0) + 1,
      ...newDocumentType,
      fields: [],
      sampleDocuments: [],
      settings: defaultSettings,
    };
    setDocumentTypes(prev => [...prev, newType]);
    setShowAddTypeModal(false);
    setNewDocumentType({
      name: '',
      description: '',
    });
  };

  const handleUpdateSettings = (typeId: number, settings: DocumentSettings) => {
    setDocumentTypes(prev =>
      prev.map(type =>
        type.id === typeId
          ? { ...type, settings }
          : type
      )
    );
    setShowSettingsModal(null);
  };

  const handleAddField = () => {
    if (!selectedType) return;

    const newFieldWithId: ExtractionField = {
      id: Math.max(...selectedType.fields.map(f => f.id), 0) + 1,
      ...newField,
    };

    setDocumentTypes(prev =>
      prev.map(type =>
        type.id === selectedType.id
          ? { ...type, fields: [...type.fields, newFieldWithId] }
          : type
      )
    );

    setShowFieldModal(false);
    setNewField({
      name: '',
      description: '',
      type: 'text',
      options: [],
      required: false,
    });
    setSelectedField(null);
  };

  const handleEditField = (typeId: number, field: ExtractionField) => {
    const docType = documentTypes.find(t => t.id === typeId);
    if (!docType) return;

    setSelectedType(docType);
    setSelectedField(field);
    setNewField({
      name: field.name,
      description: field.description,
      type: field.type,
      options: field.options,
      required: field.required,
      validation: field.validation,
      defaultValue: field.defaultValue,
    });
    setShowFieldModal(true);
  };

  const handleUpdateField = () => {
    if (!selectedType || !selectedField) return;

    setDocumentTypes(prev =>
      prev.map(type =>
        type.id === selectedType.id
          ? {
              ...type,
              fields: type.fields.map(field =>
                field.id === selectedField.id
                  ? { ...field, ...newField }
                  : field
              ),
            }
          : type
      )
    );

    setShowFieldModal(false);
    setNewField({
      name: '',
      description: '',
      type: 'text',
      options: [],
      required: false,
    });
    setSelectedField(null);
  };

  const handleDeleteField = (typeId: number, fieldId: number) => {
    setDocumentTypes(prev =>
      prev.map(type =>
        type.id === typeId
          ? { ...type, fields: type.fields.filter(f => f.id !== fieldId) }
          : type
      )
    );
    setShowDeleteFieldModal(null);
  };

  const handleFileUpload = (docTypeId: number, files: FileList) => {
    setDocumentTypes(prev =>
      prev.map(type =>
        type.id === docTypeId
          ? { ...type, sampleDocuments: [...type.sampleDocuments, ...Array.from(files)] }
          : type
      )
    );
  };

  const handleDeleteType = (id: number) => {
    setDocumentTypes(prev => prev.filter(type => type.id !== id));
    setShowDeleteModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Extractor</h1>
          <p className="text-muted-foreground mt-2">
            Configure document types and extraction rules for automated data processing.
          </p>
        </div>
        <Button
          onClick={() => setShowAddTypeModal(true)}
          className="bg-primary hover:bg-primary/90"
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
                    {docType.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettingsModal(docType.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteModal(docType.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sample Documents</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && handleFileUpload(docType.id, e.target.files)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                {docType.sampleDocuments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {docType.sampleDocuments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted text-sm">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Extraction Fields</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedType(docType);
                      setSelectedField(null);
                      setNewField({
                        name: '',
                        description: '',
                        type: 'text',
                        options: [],
                        required: false,
                      });
                      setShowFieldModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium text-sm">Field Name</th>
                          <th className="px-4 py-2 text-left font-medium text-sm">Type</th>
                          <th className="px-4 py-2 text-left font-medium text-sm">Required</th>
                          <th className="px-4 py-2 text-left font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docType.fields.map((field, index) => (
                          <tr key={field.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                            <td className="px-4 py-2 text-sm">{field.name}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs bg-primary/10">
                                {field.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {field.required ? (
                                <span className="text-green-600">Yes</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditField(docType.id, field)}
                                  className="h-8 w-8"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setShowDeleteFieldModal({ typeId: docType.id, fieldId: field.id })}
                                  className="h-8 w-8 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Document Type</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddTypeModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newDocumentType.name}
                  onChange={(e) => setNewDocumentType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Invoice, Purchase Order"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDocumentType.description}
                  onChange={(e) => setNewDocumentType(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the document type and its purpose"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddTypeModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddDocumentType}>
                  Add Document Type
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Settings Modal */}
      {showSettingsModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Document Type Settings</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettingsModal(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {documentTypes.find(t => t.id === showSettingsModal)?.settings && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Document Type Name</Label>
                  <Input
                    value={documentTypes.find(t => t.id === showSettingsModal)?.name}
                    onChange={(e) => {
                      setDocumentTypes(prev =>
                        prev.map(type =>
                          type.id === showSettingsModal
                            ? { ...type, name: e.target.value }
                            : type
                        )
                      );
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    value={documentTypes.find(t => t.id === showSettingsModal)?.description}
                    onChange={(e) => {
                      setDocumentTypes(prev =>
                        prev.map(type =>
                          type.id === showSettingsModal
                            ? { ...type, description: e.target.value }
                            : type
                        )
                      );
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={documentTypes.find(t => t.id === showSettingsModal)?.settings.confidenceThreshold}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setDocumentTypes(prev =>
                          prev.map(type =>
                            type.id === showSettingsModal
                              ? {
                                  ...type,
                                  settings: {
                                    ...type.settings,
                                    confidenceThreshold: value,
                                  },
                                }
                              : type
                          )
                        );
                      }}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm">
                      {(documentTypes.find(t => t.id === showSettingsModal)?.settings.confidenceThreshold || 0) * 100}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoValidation">Auto Validation</Label>
                    <input
                      type="checkbox"
                      checked={documentTypes.find(t => t.id === showSettingsModal)?.settings.autoValidation}
                      onChange={(e) => {
                        setDocumentTypes(prev =>
                          prev.map(type =>
                            type.id === showSettingsModal
                              ? {
                                  ...type,
                                  settings: {
                                    ...type.settings,
                                    autoValidation: e.target.checked,
                                  },
                                }
                              : type
                          )
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyOnExtraction">Notify on Extraction</Label>
                    <input
                      type="checkbox"
                      checked={documentTypes.find(t => t.id === showSettingsModal)?.settings.notifyOnExtraction}
                      onChange={(e) => {
                        setDocumentTypes(prev =>
                          prev.map(type =>
                            type.id === showSettingsModal
                              ? {
                                  ...type,
                                  settings: {
                                    ...type.settings,
                                    notifyOnExtraction: e.target.checked,
                                  },
                                }
                              : type
                          )
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="retryOnFailure">Retry on Failure</Label>
                    <input
                      type="checkbox"
                      checked={documentTypes.find(t => t.id === showSettingsModal)?.settings.retryOnFailure}
                      onChange={(e) => {
                        setDocumentTypes(prev =>
                          prev.map(type =>
                            type.id === showSettingsModal
                              ? {
                                  ...type,
                                  settings: {
                                    ...type.settings,
                                    retryOnFailure: e.target.checked,
                                  },
                                }
                              : type
                          )
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </div>

                  {documentTypes.find(t => t.id === showSettingsModal)?.settings.retryOnFailure && (
                    <div className="space-y-2">
                      <Label htmlFor="maxRetries">Max Retries</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={documentTypes.find(t => t.id === showSettingsModal)?.settings.maxRetries}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setDocumentTypes(prev =>
                            prev.map(type =>
                              type.id === showSettingsModal
                                ? {
                                    ...type,
                                    settings: {
                                      ...type.settings,
                                      maxRetries: value,
                                    },
                                  }
                                : type
                            )
                          );
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettingsModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const settings = documentTypes.find(t => t.id === showSettingsModal)?.settings;
                      if (settings) {
                        handleUpdateSettings(showSettingsModal, settings);
                      }
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Field Modal */}
      {showFieldModal && selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {selectedField ? 'Edit Extraction Field' : 'Add Extraction Field'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowFieldModal(false);
                  setSelectedField(null);
                  setNewField({
                    name: '',
                    description: '',
                    type: 'text',
                    options: [],
                    required: false,
                  });
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fieldName">Field Name</Label>
                <Input
                  id="fieldName"
                  value={newField.name}
                  onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., invoiceNumber, amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldDescription">Description</Label>
                <Textarea
                  id="fieldDescription"
                  value={newField.description}
                  onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this field represents"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldType">Field Type</Label>
                <Select
                  value={newField.type}
                  onValueChange={(value: 'text' | 'number' | 'select' | 'date' | 'boolean') => {
                    setNewField(prev => ({
                      ...prev,
                      type: value,
                      options: value === 'select' ? [] : undefined,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newField.type === 'select' && (
                <div className="space-y-2">
                  <Label htmlFor="options">Options (comma-separated)</Label>
                  <Input
                    id="options"
                    value={newField.options?.join(', ') || ''}
                    onChange={(e) => setNewField(prev => ({
                      ...prev,
                      options: e.target.value.split(',').map(o => o.trim()).filter(Boolean),
                    }))}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="validation">Validation Rule</Label>
                <Input
                  id="validation"
                  value={newField.validation || ''}
                  onChange={(e) => setNewField(prev => ({ ...prev, validation: e.target.value }))}
                  placeholder="e.g., ^[A-Z]{2}\d{6}$ for format validation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input
                  id="defaultValue"
                  value={newField.defaultValue || ''}
                  onChange={(e) => setNewField(prev => ({ ...prev, defaultValue: e.target.value }))}
                  placeholder="Enter default value"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newField.required}
                  onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="required">Required Field</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFieldModal(false);
                    setSelectedField(null);
                    setNewField({
                      name: '',
                      description: '',
                      type: 'text',
                      options: [],
                      required: false,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={selectedField ? handleUpdateField : handleAddField}>
                  {selectedField ? 'Save Changes' : 'Add Field'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Type Modal */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this document type? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteType(showDeleteModal)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Field Modal */}
      {showDeleteFieldModal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Confirm Field Deletion</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this extraction field? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteFieldModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteField(showDeleteFieldModal.typeId, showDeleteFieldModal.fieldId)}
              >
                Delete Field
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}