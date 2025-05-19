'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { type Checklist, type ColumnSchema } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  
  // Add state for column ordering
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  
  // State for drag operation
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Memoize customColumns to prevent infinite rendering
  const customColumns = React.useMemo(() => columns.slice(4), [columns]);
  
  // Initialize column order from columns when component mounts or columns change
  useEffect(() => {
    setColumnOrder(prevOrder => {
      // Only update if the columns have changed
      const currentColumnNames = customColumns.map(column => column.name);
      const hasNewColumns = currentColumnNames.some(name => !prevOrder.includes(name));
      const hasMissingColumns = prevOrder.some(name => 
        !currentColumnNames.includes(name) && !hiddenColumns.has(name)
      );
      
      if (hasNewColumns || hasMissingColumns) {
        return currentColumnNames;
      }
      return prevOrder;
    });
  }, [customColumns, hiddenColumns]);

  // Get visible custom columns and sort them according to columnOrder
  const visibleCustomColumns = React.useMemo(() => {
    // Filter out hidden columns
    const filtered = customColumns.filter(column => !hiddenColumns.has(column.name));
    
    // Sort them according to columnOrder
    return filtered.sort((a, b) => {
      const aIndex = columnOrder.indexOf(a.name);
      const bIndex = columnOrder.indexOf(b.name);
      // If a column is not in the order array, place it at the end
      return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - 
             (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
    });
  }, [customColumns, hiddenColumns, columnOrder]);

  // Functions to hide and delete a column
  const handleHideColumn = (columnName: string) => {
    setHiddenColumns(prev => {
      const newHidden = new Set(prev);
      newHidden.add(columnName);
      return newHidden;
    });
  };

  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteColumn = async (columnName: string) => {
    setColumnToDelete(columnName);
  };

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;
    
    setIsDeleting(true);
    try {
      const payload = {
        name: columnToDelete,
      };
      await api.post('/audit/v2/project/schema/delete/', payload);
      console.log(`Column ${columnToDelete} deleted successfully`);
      setHiddenColumns(prev => {
        const newHidden = new Set(prev);
        newHidden.add(columnToDelete);
        return newHidden;
      });
      setColumnToDelete(null);
    } catch (error) {
      console.error('Error deleting column:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, columnName: string) => {
    setDraggedColumn(columnName);
    e.dataTransfer.effectAllowed = 'move';
    // Add a custom class to style the dragged element
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Only proceed if we're dragging a column and it's not over itself
    if (!draggedColumn || draggedColumn === columnName) return;
    
    // Add visual indicator for drop target
    e.currentTarget.classList.add('drop-target');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Remove visual indicator when drag leaves
    e.currentTarget.classList.remove('drop-target');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnName: string) => {
    e.preventDefault();
    // Remove visual indicators
    e.currentTarget.classList.remove('drop-target');
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    
    if (!draggedColumn || draggedColumn === targetColumnName) return;
    
    // Reorder columns
    setColumnOrder(prevOrder => {
      const newOrder = [...prevOrder];
      const draggedIdx = newOrder.indexOf(draggedColumn);
      const targetIdx = newOrder.indexOf(targetColumnName);
      
      if (draggedIdx !== -1 && targetIdx !== -1) {
        // Remove the dragged column
        newOrder.splice(draggedIdx, 1);
        // Insert it at the target position
        newOrder.splice(targetIdx, 0, draggedColumn);
      }
      
      return newOrder;
    });
    
    setDraggedColumn(null);
  };

  const handleDragEnd = () => {
    // Clean up any remaining visual indicators
    document.querySelectorAll('.dragging, .drop-target').forEach(el => {
      el.classList.remove('dragging');
      el.classList.remove('drop-target');
    });
    setDraggedColumn(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        {/* Add styles for drag and drop visual feedback */}
        <style jsx global>{`
          .dragging {
            opacity: 0.5;
          }
          .drop-target {
            border-left: 2px dashed #666;
            border-right: 2px dashed #666;
          }
        `}</style>
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Fixed columns */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Log
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
                    <div 
                      className="flex items-center justify-between"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, column.name)}
                      onDragOver={(e) => handleDragOver(e, column.name)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, column.name)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="cursor-grab">{column.name}</span>
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

      <AlertDialog 
        open={!!columnToDelete} 
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setColumnToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the column "{columnToDelete}" and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteColumn} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Column'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}