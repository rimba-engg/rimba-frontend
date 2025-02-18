'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X, FileText, Upload, Settings, ChevronRight, Trash2, Edit2, MoreVertical, Grid } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatCard } from './stats-card';
import { TaskTable } from './task-table';
import { TaskSidebar } from './task-sidebar';
import { TaskFormModal } from './task-form-modal';
import { AssignModal } from './modals/assign-modal';
import { DeleteModal } from './modals/delete-modal';
import { TaskStatus, type ExtendedChecklistItem, type FormData, type CustomColumn, type User, type Checklist } from '@/lib/types';

const initialFormData: FormData = {
  issueNumber: '',
  description: '',
  documentRef: '',
  standardRef: '',
  auditorComment: '',
  classification: null,
  brightmarkComment: '',
};

export default function ChecklistClient({ data }: { data: Checklist }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [showTaskSidebar, setShowTaskSidebar] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [checklistItems, setChecklistItems] = useState<ExtendedChecklistItem[]>(
    data.checklist_items.map(item => ({
      id: item.id,
      issueNumber: '',
      description: item.description || '',
      documentRef: '',
      standardRef: '',
      auditorComment: '',
      classification: null,
      brightmarkComment: '',
      status: item.status as TaskStatus || TaskStatus.NOT_STARTED,
      createdBy: item.created_by || null,
      assignedTo: item.assigned_users?.[0]?.id || '',
      assignedToUser: item.assigned_users?.[0] ? {
        id: item.assigned_users[0].id,
        email: item.assigned_users[0].email || '',
        first_name: item.assigned_users[0].first_name || '',
        last_name: item.assigned_users[0].last_name || '',
        avatar: item.assigned_users[0].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.assigned_users[0].first_name + ' ' + item.assigned_users[0].last_name)}&background=random`
      } : undefined,
      comments: [],
      customFields: {},
      documents: [],
    }))
  );
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState<User[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const newItem: ExtendedChecklistItem = {
        ...formData,
        id: Date.now().toString(),
        status: TaskStatus.NOT_STARTED,
        createdBy: null,
        comments: [],
        customFields: {},
        documents: [],
      };
      setChecklistItems([...checklistItems, newItem]);
      setShowAddModal(false);
    }
    
    setFormData(initialFormData);
  };

  const handleEdit = (item: ExtendedChecklistItem) => {
    setFormData(item);
    setShowEditModal(item.id);
  };

  const handleDelete = (id: string) => {
    setChecklistItems(items => items.filter(item => item.id !== id));
    setShowDeleteModal(null);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    const columnId = newColumnName.toLowerCase().replace(/\s+/g, '_');
    setCustomColumns(prev => [...prev, { id: columnId, name: newColumnName }]);
    
    setChecklistItems(prev => 
      prev.map(item => ({
        ...item,
        customFields: {
          ...item.customFields,
          [columnId]: ''
        }
      }))
    );
    
    setNewColumnName('');
    setShowAddColumnModal(false);
  };

  const handleCustomFieldChange = (itemId: string, columnId: string, value: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              customFields: {
                ...item.customFields,
                [columnId]: value
              }
            }
          : item
      )
    );
  };

  const handleStatusChange = async (itemId: string, status: TaskStatus) => {
    try {
      // Make API call to update status
      await api.post('/audit/v2/update_checklist_status/', {
        item_id: itemId,
        status: status
      });

      // Update local state only after successful API call
      setChecklistItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, status }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      // Optionally add error handling UI here
    }
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

  return (
    <div className="max-w-[calc(100vw-16rem)] mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/audit/projects"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Checklists
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{data.checklist_name}</span>
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

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <StatCard
              title="Completion Rate"
              value={stats.completion.value}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress.value}
            />
          </div>

          <div className="flex-1 overflow-hidden bg-white rounded-lg shadow">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                <TaskTable
                  items={checklistItems}
                  customColumns={customColumns}
                  onEdit={handleEdit}
                  onDelete={id => setShowDeleteModal(id)}
                  onAssign={id => setShowAssignModal(id)}
                  onStatusChange={handleStatusChange}
                  onCustomFieldChange={handleCustomFieldChange}
                  onTaskClick={id => setShowTaskSidebar(id)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTaskSidebar !== null && (
        <TaskSidebar
          task={checklistItems.find(item => item.id === showTaskSidebar)!}
          onClose={() => setShowTaskSidebar(null)}
          onStatusChange={handleStatusChange}
          onAssign={id => setShowAssignModal(id)}
          onAddComment={handleAddComment}
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

      <DeleteModal
        isOpen={showDeleteModal !== null}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => handleDelete(showDeleteModal!)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}