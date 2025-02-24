'use client';

import { User2, ArrowUpDown, MoreHorizontal, Eye } from 'lucide-react';
import { type ChecklistItem, type ColumnSchema, type User } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import React from 'react';
import { api } from '@/lib/api';
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
  // State for sorting
  console.log(`checklistId: ${checklistId}`);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ columnName: null, direction: 'asc' });
  
  // State for hidden columns
  const [hiddenColumns, setHiddenColumns] = React.useState<Set<string>>(new Set());

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

  // Get visible columns
  const visibleColumns = React.useMemo(() => {
    return schema.filter(column => !hiddenColumns.has(column.name));
  }, [schema, hiddenColumns]);

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

  const renderFieldValue = (checklist_item: ChecklistItem, column: ColumnSchema) => {
    switch (column.type) {
      case 'user':
        const user: User = checklist_item.column_data[column.name] || {};
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFieldChange(checklist_item.id, column.name, user.id);
            }}
            className="flex checklist_items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {user ? (
              <>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=random`}
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
      case 'single_select':
      case 'multi_select':
        return (
          <select
            value={checklist_item.column_data[column.name] || ''}
            onChange={(e) => onFieldChange(checklist_item.id, column.name, e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
            onClick={(e) => e.stopPropagation()}
            multiple={column.type === 'multi_select'}
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
            onChange={(e) => onFieldChange(checklist_item.id, column.name, e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={checklist_item.column_data[column.name] || ''}
            onChange={(e) => onFieldChange(checklist_item.id, column.name, e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        );
      default:
        return (
          <div className="w-full min-h-[60px] text-sm p-2 rounded-md">
            {checklist_item.column_data[column.name] || ''}
          </div>
        );
    }
  };

  return (
    <div className="relative w-full">
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left py-3 px-4">#</th>
            {visibleColumns.map(column => (
              <th key={column.name} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(column.name)}
                    className="flex items-center gap-1 hover:bg-transparent"
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