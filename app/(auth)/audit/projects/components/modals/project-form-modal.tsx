'use client';

import { X, Building, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Project {
  _id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  checklist_items?: string[];
}

interface ProjectFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  project: Partial<Project>;
  onClose: () => void;
  onChange: (field: keyof Project, value: string) => void;
  onSubmit: () => void;
}

export function ProjectFormModal({
  isOpen,
  mode,
  project,
  onClose,
  onChange,
  onSubmit,
}: ProjectFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {mode === 'create' ? 'Create New Project' : 'Edit Project Information'}
          </h3>
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
          <div>
            <Label>Project Name</Label>
            <div className="flex items-center gap-2">
              <Building className="text-gray-400" size={20} />
              <Input
                value={project.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Enter project name"
              />
            </div>
          </div>

          {mode === 'edit' && (
            <>
              <div>
                <Label>Created Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400" size={20} />
                  <Input
                    value={project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
                    disabled
                  />
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400" size={20} />
                  <Input
                    value={project.updated_at ? new Date(project.updated_at).toLocaleDateString() : ''}
                    disabled
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-[#1B4D3E] hover:bg-[#163B30]"
          >
            {mode === 'create' ? 'Create Project' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}