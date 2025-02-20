'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Grid } from 'lucide-react';
import { ChecklistTable } from './components/projects-table';
import { DeleteModal } from './components/modals/delete-modal';
import { ProjectFormModal } from './components/modals/project-form-modal';
import { api } from '@/lib/api';
import { type ColumnSchema, type Checklist } from '@/lib/types';

interface ChecklistResponse {
  data: {
    checklists: Checklist[];
  };
}

interface CreateChecklistResponse {
  status: number;
  message?: string;
  data?: {
    checklist_id: string;
  };
}

interface DeleteChecklistResponse {
  status: number;
  message?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Checklist>({} as Checklist);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const response = await api.get<ChecklistResponse>('/audit/v2/checklist');
      setChecklists(response.data.checklists);
      
      setError(null);
    } catch (err) {
      setError('Failed to load checklists');
      console.error('Error fetching checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChecklist = async () => {
    if (isSubmitting || !formData.name.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await api.post<CreateChecklistResponse>('/audit/v2/checklist/create/', {
        name: formData.name
      });

      if (response.status === 200) {
        await fetchChecklists();
        setShowCreateModal(false);
        // Set formData with a complete Checklist object to avoid type errors
        setFormData({ 
          id: '', 
          name: '', 
          checklist_items: [], 
          created_by: JSON.parse(localStorage.getItem('user') || '{}'), 
          updated_at: new Date().toISOString() 
        });
      } else {
        throw new Error(response.message || 'Failed to create checklist');
      }
    } catch (err) {
      // Log the error with traceback
      setError('Failed to create checklist');
      console.error('Error creating checklist:', err);
      setError('Failed to create checklist');
      console.error('Error creating checklist:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddColumn = async () => {
    if (isAddingColumn) return;
    setIsAddingColumn(true);
    setError(null);

    try {
      const newColumn: ColumnSchema = {
        id: `custom_${Date.now()}`,
        name: 'New Column',
        type: 'text',
        options: []
      };

      // TODO: Add the column to all checklists
      // // Add the column to all checklists
      // await api.post('', {
      //   field: newColumn
      // });

      // Refresh checklists to get updated data
      await fetchChecklists();
    } catch (err) {
      setError('Failed to add column');
      console.error('Error adding column:', err);
    } finally {
      setIsAddingColumn(false);
    }
  };

  const handleChecklistClick = (checklistId: string) => {
    router.push(`/audit/checklist?id=${checklistId}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.post<DeleteChecklistResponse>('/audit/v2/checklist/delete/', {
        checklist_id: id
      });

      if (response.status === 200) {
        await fetchChecklists();
        setShowDeleteConfirm(null);
      } else {
        throw new Error(response.message || 'Failed to delete checklist');
      }
    } catch (err) {
      setError('Failed to delete checklist');
      console.error('Error deleting checklist:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading checklists...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[calc(100vw-16rem)] mx-auto">
      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Checklists</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#163B30] transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                New Checklist
              </button>
              <button
                onClick={handleAddColumn}
                disabled={isAddingColumn}
                className="bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#163B30] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Grid size={16} />
                {isAddingColumn ? 'Adding...' : 'Add Column'}
              </button>
            </div>
          </div>

          <ChecklistTable
            projects={checklists}
            columns={[
              { id: 'name', name: 'Name', type: 'text' },
              { id: 'updated_at', name: 'Last Updated', type: 'date' },
              { id: 'items_count', name: '# Tasks', type: 'number' },
              { id: 'progress_percentage', name: 'Progress', type: 'number' },
            ]}
            onEdit={(id) => setShowEditModal(id)}
            onDelete={(id) => setShowDeleteConfirm(id)}
            onChecklistClick={handleChecklistClick}
          />
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => handleDelete(showDeleteConfirm!)}
      />

      <ProjectFormModal
        isOpen={showCreateModal || showEditModal !== null}
        mode={showCreateModal ? 'create' : 'edit'}
        project={showCreateModal ? formData : checklists.find(c => c.id === showEditModal) || {} as Checklist}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(null);
          setFormData({} as Checklist);
        }}
        onChange={(field, value) => {
          setFormData(prev => ({ ...prev, [field]: value }));
        }}
        onSubmit={handleCreateChecklist}
      />
    </div>
  );
}