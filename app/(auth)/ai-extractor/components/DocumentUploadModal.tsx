import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DocumentType } from '../types'; // Adjust the import path as needed
import { BASE_URL, defaultHeaders } from '@/lib/api';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset the file selection whenever the modal opens.
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
    }
  }, [isOpen]);

  // Determine if we currently have files selected.
  const hasFilesSelected = selectedFiles.length > 0;

  // Append new files to our list whenever the file input changes.
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      // Clear the input's value so that a user can select the same file again if needed.
      e.target.value = "";
    }
  };

  const handleUpload = async () => {
    if (!hasFilesSelected) return;
    setIsUploading(true);
    try {
      // Set up the headers with your authorization token.
      const token = localStorage.getItem('access_token');
      const myHeaders = new Headers();
      myHeaders.append(
        'Authorization', `Bearer ${token}`
      );
      // Create the form data and append each file.
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("documents", file, file.name);
      });
      
      // Append the additional fields.
      const currentMonthIndex = new Date().getMonth() + 1; // getMonth() returns 0 for January, so we add 1
      formData.append("for_month", currentMonthIndex.toString());
      formData.append("is_sample", "true");
      // You can either use the docType prop here (if it represents the correct ID), or use a hard-coded value.
      formData.append("document_type", docType.id);
      const uploadHeaders = { ...defaultHeaders } as Record<string, string>;
      // For multipart/form-data, we should remove the Content-Type
      // and let the browser set it with the correct boundary
      delete uploadHeaders['Content-Type'];

      // Set up the request options.
      const requestOptions = {
        method: "POST",
        headers: uploadHeaders,
        body: formData,
        redirect: "follow" as RequestRedirect,
      };

      // Make the API call.
      const response = await fetch(`${BASE_URL}/v2/document/upload/`, requestOptions);
      const result = await response.text();
      console.log("Upload result:", result);

      // Notify the parent component of a successful upload.
      onUpload(selectedFiles, docType);
      onClose();
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Sample Documents : {docType.name}</h3>
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
            {/* The hidden file input used to pick files */}
            <input
              id="document-file"
              type="file"
              multiple
              onChange={handleFileSelection}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="mt-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                {hasFilesSelected ? 'Add More Files' : 'Select Files'}
              </Button>
            </div>

            {/* Display the list of selected file names, if there are any */}
            {hasFilesSelected && (
              <div className="mt-4">
                <p className="font-semibold">Selected Files:</p>
                <ul className="list-disc pl-5">
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display an error below if no files have been chosen */}
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