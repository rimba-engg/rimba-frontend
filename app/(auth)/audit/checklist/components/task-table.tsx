'use client';

import { User2, ArrowUpDown, MoreHorizontal, Eye } from 'lucide-react';
import { Customer, type ChecklistItem, type ColumnSchema, type User } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredCustomer } from '@/lib/auth';

interface TaskTableProps {
  checklistId: string;
  checklist_items: ChecklistItem[];
  schema: ColumnSchema[];
  onFieldChange: (itemId: string, columnId: string, value: string) => void;
  onTaskClick: (id: string) => void;
}

// Type for sort configuration
type SortConfig = {
  columnName: string | null;
  direction: 'asc' | 'desc';
};

export function TaskTable({
  checklistId,
  checklist_items,
  schema,
  onFieldChange,
  onTaskClick,
}: TaskTableProps) {
  // For demonstration, assuming logged in user role is ADMIN.
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  useEffect(() => {
    const customer = getStoredCustomer();
    setCustomerData(customer);
  }, []);
  
  // State for sorting
  console.log(`checklistId: ${checklistId}`);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ columnName: null, direction: 'asc' });
  
  // State for hidden columns
  const [hiddenColumns, setHiddenColumns] = React.useState<Set<string>>(new Set(['Created By', 'Entry Date']));
  
  // Add state for column ordering
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  
  // State for drag operation
  const [draggedColumn, setDraggedColumn] = React.useState<string | null>(null);

  // Initialize column order from schema when component mounts or schema changes
  useEffect(() => {
    setColumnOrder(schema.map(column => column.name));
  }, [schema]);

  // Column management functions
  const handleHideColumn = (columnName: string) => {
    setHiddenColumns(prev => {
      const newHidden = new Set(prev);
      newHidden.add(columnName);
      return newHidden;
    });
  };

  const handleShowColumn = (columnName: string) => {
    setHiddenColumns(prev => {
      const newHidden = new Set(prev);
      newHidden.delete(columnName);
      return newHidden;
    });
  };

  const handleDeleteColumn = async (columnName: string) => {
    console.log(`Delete column: ${columnName}`);
    try {
      const payload = {
        checklist_id: checklistId,
        column_name: columnName,
      };
      await api.post('/audit/v2/checklist/item/schema/delete/', payload);
      console.log(`Column ${columnName} deleted successfully`);
      // Optionally, update the state to reflect the deleted column
      setHiddenColumns(prev => {
        const newHidden = new Set(prev);
        newHidden.add(columnName);
        return newHidden;
      });
    } catch (error) {
      console.error('Error deleting column:', error);
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnName: string) => {
    e.preventDefault();
    // Remove visual indicators
    e.currentTarget.classList.remove('drop-target');
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    
    if (!draggedColumn || draggedColumn === targetColumnName) return;
    
    // Reorder columns
    const newColumnOrder = [...columnOrder];
    const draggedIdx = newColumnOrder.indexOf(draggedColumn);
    const targetIdx = newColumnOrder.indexOf(targetColumnName);
    
    if (draggedIdx !== -1 && targetIdx !== -1) {
      // Remove the dragged column
      newColumnOrder.splice(draggedIdx, 1);
      // Insert it at the target position
      newColumnOrder.splice(targetIdx, 0, draggedColumn);
      
      // Update local state
      setColumnOrder(newColumnOrder);
      
      try {
        // Create a new schema array with the updated order
        const updatedSchema = newColumnOrder.map(colName => 
          schema.find(col => col.name === colName)
        ).filter(Boolean);
        
        // Save the updated schema to the server
        await api.post('/audit/v2/checklist/item/schema/reorder/', {
          checklist_id: checklistId,
          schema: updatedSchema
        });
        
        console.log('Column order updated successfully on the server');
      } catch (error) {
        console.error('Error updating column order:', error);
        // Optionally revert back to previous order on error
        setColumnOrder(columnOrder);
      }
    }
    
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

  // Get visible columns
  const visibleColumns = React.useMemo(() => {
    // Filter out hidden columns
    const filteredColumns = schema.filter(column => !hiddenColumns.has(column.name));
    
    // Sort them according to columnOrder
    return filteredColumns.sort((a, b) => {
      const aIndex = columnOrder.indexOf(a.name);
      const bIndex = columnOrder.indexOf(b.name);
      // If a column is not in the order array, place it at the end
      return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - 
             (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
    });
  }, [schema, hiddenColumns, columnOrder]);

  // Sorting handler
  const handleSort = (columnName: string) => {
    setSortConfig(current => ({
      columnName,
      direction: current.columnName === columnName && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort the checklist items
  const sortedItems = React.useMemo(() => {
    if (!sortConfig.columnName) return checklist_items;

    return [...checklist_items].sort((a, b) => {
      // Type guard to handle null columnName
      if (!sortConfig.columnName) return 0;
      
      const aValue = a.column_data[sortConfig.columnName];
      const bValue = b.column_data[sortConfig.columnName];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [checklist_items, sortConfig]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'NOT_STARTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFieldValue = (checklist_item: ChecklistItem, column: ColumnSchema) => {
    // Determine if field is editable based on schema definition and logged in user's role.
    // If column.editable is not set, the field is editable.
    // const isEditable = !column.editable || (column.editable === 'ADMIN' && customerData?.role === 'ADMIN');
    const isEditable = false;

    // Special handling for status field
    if (column.name === 'Status') {
      return (
        <div className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(checklist_item.status)}`}>
          {checklist_item.status}
        </div>
      );
    }

    switch (column.type) {
      case 'user': {
        const user: User = checklist_item.column_data[column.name] || {};
        if (isEditable) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFieldChange(checklist_item.id, column.name, user.id);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {user && user.id ? (
                <>
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.first_name + ' ' + user.last_name
                    )}&background=random`}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{user.first_name}</span>
                </>
              ) : (
                <>
                  <User2 className="w-5 h-5" />
                  <span>Assign</span>
                </>
              )}
            </button>
          );
        } else {
          return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {user && user.id ? (
                <>
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.first_name + ' ' + user.last_name
                    )}&background=random`}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{user.first_name}</span>
                </>
              ) : (
                <>
                  <User2 className="w-5 h-5" />
                  <span>Assign</span>
                </>
              )}
            </div>
          );
        }
      }
      case 'single_select':
      case 'multi_select':
        return (
          <select
            value={checklist_item.column_data[column.name] || ''}
            onChange={isEditable ? (e) => onFieldChange(checklist_item.id, column.name, e.target.value) : undefined}
            className="w-full px-2 py-1 border rounded text-sm"
            onClick={(e) => e.stopPropagation()}
            multiple={column.type === 'multi_select'}
            disabled={!isEditable}
          >
            <option value="">Select...</option>
            {column.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={checklist_item.column_data[column.name] || ''}
            onChange={isEditable ? (e) => onFieldChange(checklist_item.id, column.name, e.target.value) : undefined}
            className="w-full px-2 py-1 border rounded text-sm"
            onClick={(e) => e.stopPropagation()}
            disabled={!isEditable}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={checklist_item.column_data[column.name] || ''}
            onChange={isEditable ? (e) => onFieldChange(checklist_item.id, column.name, e.target.value) : undefined}
            className="w-full px-2 py-1 border rounded text-sm"
            onClick={(e) => e.stopPropagation()}
            disabled={!isEditable}
          />
        );
      default:
        // For a default "text" field, if it is editable we render an input so that changes can be made.
        if (isEditable) {
          return (
            <input
              type="text"
              value={checklist_item.column_data[column.name] || ''}
              onChange={(e) => onFieldChange(checklist_item.id, column.name, e.target.value)}
              className="w-full min-h-[60px] text-sm p-2 rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          );
        } else {
          return (
            <div className="w-full min-h-[60px] text-sm p-2 rounded-md">
              {checklist_item.column_data[column.name] || ''}
            </div>
          );
        }
    }
  };

  return (
    <div className="relative w-full">
      {/* Add some basic styles for drag and drop visual feedback */}
      <style jsx global>{`
        .dragging {
          opacity: 0.5;
        }
        .drop-target {
          border-left: 2px dashed #666;
          border-right: 2px dashed #666;
        }
      `}</style>
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left py-3 px-4">#</th>
            {visibleColumns.map(column => (
              <th key={column.name} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div 
                  className="flex items-center justify-between"
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, column.name)}
                  onDragOver={(e) => handleDragOver(e, column.name)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.name)}
                  onDragEnd={handleDragEnd}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(column.name)}
                    className="flex items-center gap-1 hover:bg-transparent cursor-grab"
                  >
                    {column.name}
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent">
                        <MoreHorizontal className="h-4 w-4" />
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
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((checklist_item, index) => (
            <tr key={checklist_item.id} className="hover:bg-muted/50 cursor-pointer border-b" onClick={() => onTaskClick(checklist_item.id)}>
              <td className="h-16 px-4 font-medium">{index + 1}</td>
              {visibleColumns.map(column => (
                <td key={column.name} className="w-1/3 h-16 px-4">
                  {renderFieldValue(checklist_item, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}