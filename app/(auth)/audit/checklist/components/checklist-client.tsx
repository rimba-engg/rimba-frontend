'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskTable } from './task-table';
import { TaskSidebar } from './task-sidebar';
import { TaskFormModal } from './task-form-modal';
import { AssignModal } from './modals/assign-modal';
import { AddColumnModal } from './add-column-modal';
import { TaskStatus, type ChecklistItem, type FormData, type User, type Checklist, type ColumnSchema } from '@/lib/types';
import { api } from '@/lib/api';

interface ApiResponse {
  status: number;
  data?: {
    id: string;
    [key: string]: any;
  };
  message?: string;
}

const initialFormData: FormData = {
  description: '',
};

export default function ChecklistClient({ data }: { data: Checklist }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showTaskSidebar, setShowTaskSidebar] = useState<string | null>(null);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(data.checklist_items);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = {
    completion: {
      value: checklistItems.length > 0 
        ? `${Math.round((checklistItems.filter(item => item.status === TaskStatus.COMPLETED).length / checklistItems.length) * 100)}%`
        : '0%',
    },
    inProgress: {
      value: checklistItems.filter(item => item.status === TaskStatus.IN_PROGRESS).length.toString(),
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (showEditModal !== null) {
        setChecklistItems(items =>
          items.map(item =>
            item.id === showEditModal
              ? { ...item, ...formData }
              : item
          )
        );
        setShowEditModal(null);
      } else {
        const response = await api.post<ApiResponse>('/audit/v2/checklist/item/update/', {
          description: formData.description,
          item_id: data._id
        });

        if (response.status === 200 && response.data) {
          const newItem: ChecklistItem = {
            ...formData,
            id: response.data.id,
            status: TaskStatus.NOT_STARTED,
            comments: [],
            documents: [],
            column_data: {},
          };
          setChecklistItems(prev => [...prev, newItem]);
          setShowAddModal(false);
        } else {
          throw new Error(response.message || 'Failed to create checklist item');
        }
      }
    } catch (error) {
      console.error('Error creating checklist item:', error);
    } finally {
      setIsSubmitting(false);
      setFormData(initialFormData);
    }
  };

  const handleStatusChange = async (itemId: string, status: TaskStatus) => {
    try {
      await api.post('/audit/v2/checklist/item/update/', {
        item_id: itemId,
        status: status
      });

      setChecklistItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, status }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleFieldChange = (itemId: string, columnId: string, value: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              column_data: {
                ...item.column_data,
                [columnId]: value
              }
            }
          : item
      )
    );
  };

  const handleAddComment = (itemId: string) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      user: 'John Doe',
      timestamp: new Date().toISOString(),
    };

    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, comments: [...item.comments, comment] }
          : item
      )
    );

    setNewComment('');
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const response = await api.post<ApiResponse>('/audit/v2/delete_checklist_item/', {
        checklist_id: data._id,
        checklist_item_id: id
      });

      if (response.status === 200) {
        setChecklistItems(items => items.filter(item => item.id !== id));
        setShowTaskSidebar(null);
      } else {
        throw new Error(response.message || 'Failed to delete checklist item');
      }
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddColumn = async (columnData: ColumnSchema) => {
    try {
      await api.post('/audit/v2/checklist/schema/update/', {
        checklist_id: data._id,
        schema: [...(data.schema || []), columnData]
      });

      // Update the schema in the data object
      data.schema = [...(data.schema || []), columnData];
      
      // Initialize the new field for all items
      setChecklistItems(prev => 
        prev.map(item => ({
          ...item,
          column_data: {
            ...item.column_data,
            [columnData.name]: ''
          }
        }))
      );
      
      setShowAddColumnModal(false);
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  return (
    <div className="max-w-[calc(100vw-16rem)] space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/audit/projects"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Checklists
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{data.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
          <Button variant="outline" onClick={() => setShowAddColumnModal(true)}>
            <Grid className="w-4 h-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-1">Completion Rate</h3>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold">{stats.completion.value}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-1">In Progress</h3>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold">{stats.inProgress.value}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-lg shadow">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <TaskTable
              checklist_items={checklistItems}
              schema={data.schema || []}
              onFieldChange={handleFieldChange}
              onTaskClick={id => setShowTaskSidebar(id)}
            />
          </div>
        </div>
      </div>

      {showTaskSidebar !== null && (
        <TaskSidebar
          task={checklistItems.find(item => item.id === showTaskSidebar)!}
          schema={data.schema}
          onClose={() => setShowTaskSidebar(null)}
          onStatusChange={handleStatusChange}
          onAssign={id => setShowAssignModal(id)}
          onDelete={handleDelete}
          onAddComment={handleAddComment}
          onCustomFieldChange={handleFieldChange}
          newComment={newComment}
          onNewCommentChange={setNewComment}
        />
      )}

      <TaskFormModal
        isOpen={showAddModal || showEditModal !== null}
        mode={showEditModal !== null ? 'edit' : 'add'}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(null);
          setFormData(initialFormData);
        }}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      <AssignModal
        isOpen={showAssignModal !== null}
        onClose={() => setShowAssignModal(null)}
        users={users}
        onAssign={(x) => console.log('assigned', x)}
      />

      <AddColumnModal
        isOpen={showAddColumnModal}
        onClose={() => setShowAddColumnModal(false)}
        onSubmit={handleAddColumn}
      />
    </div>
  );
}