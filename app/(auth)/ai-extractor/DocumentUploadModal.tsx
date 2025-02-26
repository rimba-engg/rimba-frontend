import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DocumentType } from './page'; // Adjust the import path as needed

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: DocumentType;
  onUpload: (uploadedFiles: File[], docType: DocumentType) => void;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  docType,
  onUpload,
}: DocumentUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Reset the file selection whenever the modal opens.
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
    }
  }, [isOpen]);

  // Ensure that at least one file is selected before allowing an upload.
  const hasFilesSelected = selectedFiles.length > 0;

  const handleUpload = async () => {
    if (!hasFilesSelected) return;
    setIsUploading(true);
    try {
      // Simulate a delay or an API call to upload the files.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Uploading files:', selectedFiles);
      onUpload(selectedFiles, docType);
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Upload Document</h3>
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
            <Label htmlFor="document-file">Select Document File(s)</Label>
            <Input
              id="document-file"
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFiles(Array.from(e.target.files));
                }
              }}
            />
            {!hasFilesSelected && (
              <p className="text-destructive text-xs mt-1">
                Please select at least one file to upload
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !hasFilesSelected}
              className="bg-primary hover:bg-primary/90"
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 