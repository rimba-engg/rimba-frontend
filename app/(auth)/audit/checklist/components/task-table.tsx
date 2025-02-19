'use client';

import { Button } from '@/components/ui/button';
import { Edit2, User2, MessageSquare } from 'lucide-react';
import { TaskStatus, type ExtendedChecklistItem } from '@/lib/types';

interface TaskTableProps {
  items: ExtendedChecklistItem[];
  customColumns: { id: string; name: string }[];
  onAssign: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onCustomFieldChange: (itemId: string, columnId: string, value: string) => void;
  onTaskClick: (id: string) => void;
}

export function TaskTable({
  items,
  customColumns,
  onAssign,
  onStatusChange,
  onCustomFieldChange,
  onTaskClick,
}: TaskTableProps) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative w-full">
      <table className="w-full border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left py-3 px-4">#</th>
            <th className="left-0 z-20 bg-muted/50 h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created By</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assignee</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[300px]">Description</th>
            {customColumns.map(column => (
              <th key={column.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="hover:bg-muted/50 cursor-pointer border-b" onClick={() => onTaskClick(item.id)}>
              <td className="h-16 px-4 font-medium">{index + 1}</td>
              <td className="left-0 z-10 bg-white h-16 px-4">
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value as TaskStatus)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value={TaskStatus.NOT_STARTED}>Not Started</option>
                  <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                  <option value={TaskStatus.COMPLETED}>Completed</option>
                </select>
              </td>
              <td className="h-16 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {item.createdBy ? (
                    <>
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.createdBy.first_name + item.createdBy.last_name)}&background=random`}
                        alt={item.createdBy.first_name + " " + item.createdBy.last_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{item.createdBy.first_name}</span>
                    </>
                  ) : (
                    <>
                    </>
                  )}
                </div>
              </td>
              <td className="h-16 px-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(item.id);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.assignedTo ? (
                    <>
                      <img
                        src={item.assignedToUser?.avatar}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{item.assignedToUser?.first_name}</span>
                    </>
                  ) : (
                    <>
                      <User2 className="w-5 h-5" />
                      <span>Assign</span>
                    </>
                  )}
                </button>
              </td>
              <td className="h-16 px-4 text-sm text-muted-foreground">{item.description}</td>
              {customColumns.map(column => (
                <td key={column.id} className="h-16 px-4">
                  <input
                    type="text"
                    value={item.customFields?.[column.id] || ''}
                    onChange={(e) => onCustomFieldChange(item.id, column.id, e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}