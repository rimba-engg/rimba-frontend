'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { type FormData } from '@/lib/types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  mode: 'add' | 'edit';
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  mode,
}: TaskFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {mode === 'add' ? 'Add New Task' : 'Edit Task'}
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
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="issueNumber">Issue Number</Label>
                <Input
                  id="issueNumber"
                  name="issueNumber"
                  value={formData.issueNumber}
                  onChange={onChange}
                  placeholder="e.g., NC-2023-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  placeholder="Describe the task..."
                  required
                  className="h-32"
                />
              </div>
              <div>
                <Label htmlFor="documentRef">Document Reference</Label>
                <Input
                  id="documentRef"
                  name="documentRef"
                  value={formData.documentRef}
                  onChange={onChange}
                  placeholder="e.g., OPR-2023-15"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="standardRef">Standard Reference</Label>
                <Input
                  id="standardRef"
                  name="standardRef"
                  value={formData.standardRef}
                  onChange={onChange}
                  placeholder="e.g., 95488(c)(5)(A)"
                  required
                />
              </div>
              <div>
                <Label htmlFor="auditorComment">Auditor's Comment</Label>
                <Textarea
                  id="auditorComment"
                  name="auditorComment"
                  value={formData.auditorComment}
                  onChange={onChange}
                  placeholder="Auditor's observations..."
                  required
                  className="h-32"
                />
              </div>
              <div>
                <Label htmlFor="classification">Classification</Label>
                <select
                  id="classification"
                  name="classification"
                  value={formData.classification || ''}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select classification</option>
                  <option value="Non-conformance">Non-conformance</option>
                  <option value="Misstatement">Misstatement</option>
                </select>
              </div>
              <div>
                <Label htmlFor="brightmarkComment">Brightmark's Comment</Label>
                <Textarea
                  id="brightmarkComment"
                  name="brightmarkComment"
                  value={formData.brightmarkComment}
                  onChange={onChange}
                  placeholder="Resolution or action taken..."
                  required
                  className="h-32"
                />
              </div>
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
              {mode === 'add' ? 'Add Task' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}