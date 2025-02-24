'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { type Checklist, type ColumnSchema } from '@/lib/types';
import { api } from '@/lib/api';

interface AllChecklistSidebarProps {
  checklist: Checklist;
  columns: ColumnSchema[];
  onClose: () => void;
  onFieldChange: (field: keyof Checklist, value: string) => void;
}

export function AllChecklistSidebar({
  checklist,
  columns,
  onClose,
  onFieldChange,
}: AllChecklistSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);

  console.log('checklist', checklist);
  console.log('columns', columns);

  // Dummy function to simulate backend update.
  // In production, replace with an actual API call with proper error handling and logging.
  const updateChecklist = async () => {
    try {
      console.log('Updating checklist:', checklist);
      
      for (const column of columns.slice(4)) {
        const olderValue = checklist.column_data?.[column.name];
        const updatedValue = checklist[column.name as keyof Checklist];

        if (olderValue !== updatedValue) {
          console.log('Updating column:', column.name, 'from', olderValue, 'to', updatedValue);
          const response = await api.post('/audit/v2/checklist/metadata/update/', {
            checklist_id: checklist.id,
            custom_field_name: column.name,
            custom_field_value: updatedValue,
          });
        }
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  // Render a labeled input field for checklist data
  const renderField = (label: string, field: keyof Checklist) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Input
        value={(checklist[field] as string) || ''}
        onChange={(e) => onFieldChange(field, e.target.value)}
        disabled={!isEditing}
        className="w-full"
      />
    </div>
  );

  console.log(checklist);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-200 ease-in-out flex flex-col">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="text-lg font-semibold">Edit Checklist</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {renderField('Name', 'name')}
          {columns.slice(4).map((column) => (
            <div key={column.name}>
              {renderField(column.name, column.name as keyof Checklist)}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer with Edit and Save Buttons */}
      <div className="p-6 border-t">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <Button onClick={updateChecklist}>
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 