'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { InsightLoader } from '@/components/ui/loader';
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
import { type UserFormData, type Project } from '../types';
import { type Checklist } from '@/lib/types';
import { getStoredCustomer } from '@/lib/auth';

interface UserFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: UserFormData;
  projects: Project[];
  checklists: Checklist[];
  onClose: () => void;
  onChange: (field: keyof UserFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading?: boolean;
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
  isLoading = false
}: UserFormModalProps) {
  if (!isOpen) return null;

  const customer = getStoredCustomer();
  console.log(customer?.name);
  const isBrightMark = customer?.name === "Brightmark";
  
  console.log(formData);

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
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => onChange('first_name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => onChange('last_name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
              disabled={mode === 'edit' || isLoading}
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
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => onChange('role', value)}
              disabled={isLoading}
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

          {isBrightMark && (
            <>
            <div className="space-y-2">
              <Label htmlFor="project">Partner</Label>
              <Select
                value={formData.project}
                onValueChange={(value) => onChange('project', value)}
                disabled={isLoading}
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
          </>

            )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <InsightLoader size="sm" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                mode === 'create' ? 'Add User' : 'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}