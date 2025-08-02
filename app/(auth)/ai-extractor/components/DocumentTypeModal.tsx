import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InsightLoader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DocumentType } from '../types';

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: DocumentType;
  onSave: (updatedDocType: DocumentType) => Promise<void>;
}

export default function DocumentTypeModal({
  isOpen,
  onClose,
  docType,
  onSave,
}: DocumentTypeModalProps) {
  const [editedDocType, setEditedDocType] = useState<DocumentType>(docType);
  const [isSaving, setIsSaving] = useState(false);

  // Update the internal state when the modal opens or the selected document type changes
  useEffect(() => {
    if (isOpen) {
      setEditedDocType(docType);
    }
  }, [isOpen, docType]);

  // A computed flag to enfore that name is not empty.
  const isNameValid = editedDocType.name.trim().length > 0;

  const handleSave = async () => {
    if (!isNameValid) return;
    setIsSaving(true);
    try {
      // Simulate a delay or API call
    //   await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Saving document type:', editedDocType);
      await onSave(editedDocType);
    } catch (error) {
      console.error('Error saving document type:', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Editing {docType.name}</h3>
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
          <div>
            <Label htmlFor="doc-type-name">Name</Label>
            <Input
              id="doc-type-name"
              value={editedDocType.name}
              onChange={(e) =>
                setEditedDocType({
                  ...editedDocType,
                  name: e.target.value,
                })
              }
              placeholder="Enter document type name"
            />
            {!isNameValid && (
              <p className="text-destructive text-xs mt-1">Name is required</p>
            )}
          </div>
          <div>
            <Label htmlFor="doc-type-description">Description</Label>
            <Textarea
              id="doc-type-description"
              value={editedDocType.description || ''}
              onChange={(e) =>
                setEditedDocType({
                  ...editedDocType,
                  description: e.target.value,
                })
              }
              placeholder="Enter document type description"
              className="h-24"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !isNameValid}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <InsightLoader size="sm" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 