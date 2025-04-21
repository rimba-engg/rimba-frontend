'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, Grid, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskTable } from './task-table';
import { TaskSidebar } from './task-sidebar';
import { TaskFormModal } from './task-form-modal';
import { AssignModal } from './modals/assign-modal';
import { AddColumnModal } from './add-column-modal';
import { TaskStatus, type ChecklistItem, type FormData, type User, type Checklist, type ColumnSchema } from '@/lib/types';
import { api, BASE_URL, defaultHeaders } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

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

export default function ChecklistClient({ checklistData, refreshChecklist, checklistItemId }: { checklistData: Checklist, refreshChecklist: () => void, checklistItemId: string | null }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showTaskSidebar, setShowTaskSidebar] = useState<string | null>(checklistItemId || null);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(checklistData.checklist_items);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
        const response = await api.post<ApiResponse>('/audit/v2/add_checklist_item/', {
          name: formData.description,
          checklist_id: checklistData.id
        });

        if (response.status === 200 && response.data) {
          setShowAddModal(false);
          refreshChecklist();
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

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklist_id', checklistData.id);
      
      // Create a new headers object instead of modifying the default one
      const uploadHeaders = { ...defaultHeaders } as Record<string, string>;
      // For multipart/form-data, we should remove the Content-Type
      // and let the browser set it with the correct boundary
      delete uploadHeaders['Content-Type'];
      
      const response = await fetch(`${BASE_URL}/audit/v2/add_checklist_item/bulk/`, {
        method: 'POST',
        body: formData,
        headers: uploadHeaders,
      });

      const responseData = await response.json();

      if (response.ok) {
        refreshChecklist();
      } else {
        throw new Error(responseData.message || 'Failed to upload checklist items');
      }
    } catch (error) {
      console.error('Error uploading checklist items:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload checklist items');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      handleFieldChange(itemId, 'Status', status);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleFieldChange = async (itemId: string, columnId: string, value: string) => {
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

    try {
      console.log(` columnId: ${columnId}`)
      await api.post('/audit/v2/update_item_custom_field_value/', {
        checklist_item_id: itemId,
        custom_field_id: columnId,
        value: value
      });
    } catch (error) {
      console.error('Failed to update custom field:', error);
    }
  };

  const handleAddComment = (itemId: string) => {
    if (!newComment.trim()) return;

    const currentUser = getStoredUser();
    if (!currentUser) return;

    const comment = {
      id: Date.now(),
      comment: newComment,
      user: {
        id: currentUser.id,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        email: currentUser.email,
      },
      created_at: new Date().toISOString(),
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
        checklist_id: checklistData.id,
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
      const newSchema = [...(checklistData.schema || []), columnData];

      console.log(checklistData);

      await api.post('/audit/v2/checklist/item/schema/update/', {
        checklist_id: checklistData.id,
        schema: newSchema
      });

      // Update the schema in the data object
      checklistData.schema = newSchema;
      
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

  const handleUserAssignment = async (taskId: string, assignedUser: User | null) => {
    try {
      console.log('assignedUser', assignedUser);
      setChecklistItems(prev =>
        prev.map(item =>
          item.id === taskId
            ? {
                ...item,
                column_data: {
                  ...item.column_data,
                  "Assigned To": assignedUser
                }
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error assigning user:', error);
    }
  };

  return (
    <div className="max-w-[calc(100vw-16rem)] space-y-6">
      {uploadError && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {uploadError}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/audit/projects"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{checklistData.name}</span>
          {/* <div className="flex gap-2 ml-4">
            <Badge variant="secondary" className="rounded-full">
              Year: 2024
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              AFP Round: 1st
            </Badge>
          </div> */}
        </div>
        <div className="flex items-center space-x-2">
          {/* Hidden file input for bulk upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBulkUpload}
            className="hidden"
            accept=".csv,.xlsx,.xls"
          />
          
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </>
            )}
          </Button>
          
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
              checklistId={checklistData.id}
              checklist_items={checklistItems}
              schema={checklistData.schema || []}
              onFieldChange={handleFieldChange}
              onTaskClick={id => setShowTaskSidebar(id)}
            />
          </div>
        </div>
      </div>

      {showTaskSidebar !== null && (
        <TaskSidebar
          checklistData={checklistData}
          task={checklistItems.find(item => item.id === showTaskSidebar)!}
          schema={checklistData.schema}
          onClose={() => setShowTaskSidebar(null)}
          onStatusChange={handleStatusChange}
          onAssign={handleUserAssignment}
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