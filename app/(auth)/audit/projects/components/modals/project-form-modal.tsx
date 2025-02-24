'use client';

import { useState, useEffect } from 'react';
import { X, Building, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Checklist } from '@/lib/types';
import { api } from '@/lib/api';

interface ProjectFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  project: Checklist;
  onClose: () => void;
  onChange: (field: keyof Checklist, value: string) => void;
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
  // State to store available projects fetched from the API.
  const [availableProjects, setAvailableProjects] = useState<
    { id: string; name: string }[]
  >([]);

  // Fetch available projects when the modal is open and in "create" mode.
  useEffect(() => {
    if (isOpen && mode === 'create') {
      const loadProjects = async () => {
        try {
          const response = await api.get<{
            message: string;
            data: { id: string; name: string }[];
            status: number;
          }>('/audit/v2/projects');

          if (response.status === 200) {
            setAvailableProjects(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch projects:', error);
        }
      };

      loadProjects();
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {mode === 'create' ? 'Create Project' : 'Edit Info'}
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
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex items-center gap-2">
              <Building className="text-gray-400" size={20} />
              <Input
                id="name"
                value={project.name || ''}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
          </div>

          {/* Dropdown for project selection (only in create mode) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="projectSelect">Project</Label>
              <select
                id="projectSelect"
                value={project.project_id || ''}
                onChange={(e) => onChange('project_id', e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="">Select a project</option>
                {availableProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'edit' && (
            <div>
              <Label>Last Updated</Label>
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-400" size={20} />
                <Input
                  value={
                    project.updated_at
                      ? new Date(project.updated_at).toLocaleDateString()
                      : ''
                  }
                  disabled
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-[#1B4D3E] hover:bg-[#163B30]"
          >
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}