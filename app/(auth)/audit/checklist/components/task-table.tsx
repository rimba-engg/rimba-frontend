'use client';

import { User2 } from 'lucide-react';
import { type ChecklistItem, type ColumnSchema, type User } from '@/lib/types';

interface TaskTableProps {
  checklist_items: ChecklistItem[];
  schema: ColumnSchema[];
  onFieldChange: (itemId: string, columnId: string, value: string) => void;
  onTaskClick: (id: string) => void;
}

export function TaskTable({
  checklist_items,
  schema,
  onFieldChange,
  onTaskClick,
}: TaskTableProps) {

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

  console.log(schema);

  return (
    <div className="relative w-full">
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left py-3 px-4">#</th>
            {schema.map(column => (
              <th key={column.name} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checklist_items.map((checklist_item, index) => (
            <tr key={checklist_item.id} className="hover:bg-muted/50 cursor-pointer border-b" onClick={() => onTaskClick(checklist_item.id)}>
              <td className="h-16 px-4 font-medium">{index + 1}</td>
              {schema.map(column => (
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