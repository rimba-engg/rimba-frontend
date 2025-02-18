'use client';

import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: () => void;
}

export function MoreOptionsModal({
  isOpen,
  onClose,
  onCreateProject,
}: MoreOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">More Options</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="space-y-4">
          <Button
            onClick={() => {
              onClose();
              onCreateProject();
            }}
            className="w-full bg-[#1B4D3E] text-white hover:bg-[#163B30] flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add New Project
          </Button>
          <Button
            className="w-full bg-[#1B4D3E] text-white hover:bg-[#163B30] flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
}