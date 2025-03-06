'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, ChevronRight, MoreHorizontal } from 'lucide-react';
import { type Checklist, type ColumnSchema } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface AllChecklistTableProps {
  projects: Checklist[];
  columns: ColumnSchema[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChecklistClick: (id: string) => void;
}

export function AllChecklistTable({
  projects,
  columns,
  onEdit,
  onDelete,
  onChecklistClick,
}: AllChecklistTableProps) {
  // state to track custom columns that have been hidden or deleted
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Only allow the custom columns (columns.slice(4)) to be hidden/deleted
  const customColumns = columns.slice(4);
  const visibleCustomColumns = customColumns.filter(column => !hiddenColumns.has(column.name));

  // Functions to hide and delete a column
  const handleHideColumn = (columnName: string) => {
    setHiddenColumns(prev => {
      const newHidden = new Set(prev);
      newHidden.add(columnName);
      return newHidden;
    });
  };

  const handleDeleteColumn = async (columnName: string) => {
    console.log(`Delete column: ${columnName}`);
    try {
      const payload = {
        name: columnName,
        // add additional identifiers here if needed.
      };
      await api.post('/audit/v2/project/schema/delete/', payload);
      console.log(`Column ${columnName} deleted successfully`);
      // after successful deletion, hide the column from the UI
      setHiddenColumns(prev => {
        const newHidden = new Set(prev);
        newHidden.add(columnName);
        return newHidden;
      });
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Fixed columns */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Checklist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              {/* Render only the visible custom columns */}
              {visibleCustomColumns.map((column) => (
                <th
                  key={column.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-between">
                    <span>{column.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleHideColumn(column.name)}>
                          Hide Column
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteColumn(column.name)}>
                          Delete Column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                {/* Fixed columns rendering */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onChecklistClick(project.id)}
                    className="group flex items-center gap-1 text-primary hover:text-primary/80"
                  >
                    <span className="font-medium">{project.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 -ml-1 transition-all group-hover:opacity-100 group-hover:ml-0" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(project.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.checklist_items.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[3rem]">
                      {project.progress_percentage}%
                    </span>
                  </div>
                </td>
                {/* Render custom columns (only visible ones) */}
                {visibleCustomColumns.map((column) => (
                  <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.column_data?.[column.name] || '-'}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onEdit(project.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(project.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}