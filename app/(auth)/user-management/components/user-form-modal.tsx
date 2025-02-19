'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { type UserFormData, type Project, type Checklist } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: UserFormData;
  projects: Project[];
  checklists: Checklist[];
  onClose: () => void;
  onChange: (field: keyof UserFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function UserFormModal({
  isOpen,
  mode,
  formData,
  projects,
  checklists,
  onClose,
  onChange,
  onSubmit,
}: UserFormModalProps) {
  if (!isOpen) return null;

  const handleChecklistToggle = (checklistId: string, checklistName: string) => {
    const currentDetails = formData.checklist_details || [];
    const exists = currentDetails.some(c => c.id === checklistId);
    
    const newDetails = exists
      ? currentDetails.filter(c => c.id !== checklistId)
      : [...currentDetails, { id: checklistId, name: checklistName }];
    
    onChange('checklist_details', newDetails);
  };

  const isChecklistSelected = (checklistId: string) => {
    return formData.checklist_details?.some(c => c.id === checklistId) || false;
  };

  return (
    <div className="fixed !mt-0 inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
              disabled={mode === 'edit'}
            />
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ''}
                onChange={(e) => onChange('password', e.target.value)}
                required={mode === 'create'}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => onChange('role', value)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role">
                  {formData.role}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="AUDITOR">Auditor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select
              value={formData.project}
              onValueChange={(value) => onChange('project', value)}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select project">
                  {formData.project}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.name} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Allowed Checklists</Label>
            <div className="border rounded-lg p-4 space-y-2 max-h-[200px] overflow-y-auto">
              {checklists.map((checklist) => (
                <div key={checklist._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={checklist._id}
                    checked={isChecklistSelected(checklist._id)}
                    onCheckedChange={() => handleChecklistToggle(checklist._id, checklist.name)}
                  />
                  <label
                    htmlFor={checklist._id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {checklist.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}