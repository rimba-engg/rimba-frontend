'use client';

import { useState } from 'react';
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

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    field_type: string;
    options?: string[];
  }) => void;
}

export function AddColumnModal({
  isOpen,
  onClose,
  onSubmit,
}: AddColumnModalProps) {
  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [options, setOptions] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!name.trim()) {
      setError('Column name is required');
      return;
    }

    if ((fieldType === 'single_select' || fieldType === 'multi_select') && !options.trim()) {
      setError('Options are required for select fields');
      return;
    }

    const formData = {
      name: name.trim(),
      field_type: fieldType,
      ...(fieldType === 'single_select' || fieldType === 'multi_select'
        ? { options: options.split(',').map(opt => opt.trim()).filter(Boolean) }
        : {}),
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="!mt-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Custom Field</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Field Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter field name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type</Label>
            <Select
              value={fieldType}
              onValueChange={setFieldType}
            >
              <SelectTrigger id="fieldType">
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="single_select">Single Select</SelectItem>
                <SelectItem value="multi_select">Multi Select</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(fieldType === 'single_select' || fieldType === 'multi_select') && (
            <div className="space-y-2">
              <Label htmlFor="options">Options (comma-separated)</Label>
              <Input
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
              />
              <p className="text-sm text-muted-foreground">
                Enter options separated by commas
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Field
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}