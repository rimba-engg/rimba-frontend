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
  const [isLoading, setIsLoading] = useState(false);
  const [columnData, setColumnData] = useState<Record<string, string>>(checklist.column_data || {});

  const updateChecklist = async () => {
    setIsLoading(true);
    
    try {
      console.log('columns', columns);
      console.log('Newer data:', columnData);
      console.log('Older data:', checklist.column_data);

      for (const column of columns.slice(4)) {
        const olderValue = checklist.column_data?.[column.name];
        const updatedValue = columnData[column.name as keyof Checklist];

        if (updatedValue !== undefined && olderValue !== updatedValue) {
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
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  // Render a labeled input field for checklist data
  const renderField = (label: string, field: keyof Checklist) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Input
        value={columnData[field] || ''}
        onChange={(e) => setColumnData({ ...columnData, [field]: e.target.value })}
        className="w-full"
      />
    </div>
  );

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-200 ease-in-out flex flex-col ${isLoading ? 'bg-gray-800 opacity-100' : ''}`}>
      {/* Sidebar Header */}
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="ms-2 text-lg font-semibold">{checklist.name}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
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
          <Button onClick={updateChecklist}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
} 