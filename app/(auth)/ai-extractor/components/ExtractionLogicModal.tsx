import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DocumentType, ExtractionLogic, ExtractionConfig } from '../types';
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

export function ExtractionLogicModal({
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
          { name: '', question: '', "undefined": '' },
        ],
      });
    };
  
    const handleRemoveField = (index: number) => {
      setEditedLogic({
        ...editedLogic,
        config: editedLogic.config.filter(
          (field: ExtractionConfig, i: number) => i !== index
        ),
      });
    };
  
    const handleSave = async () => {
      setIsSaving(true);
      try {
        // Mock API call
        // await new Promise(resolve => setTimeout(resolve, 1000));
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
            <h3 className="text-xl font-semibold">Editing Extraction Logic :  {docType.name}</h3>
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
                {editedLogic.config.map((field: ExtractionConfig, index: number) => (
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
  