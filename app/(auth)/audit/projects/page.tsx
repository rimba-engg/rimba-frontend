'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, MoreHorizontal, Plus } from 'lucide-react';
import { ProjectsTable } from './components/projects-table';
import { FilterModal } from './components/modals/filter-modal';
import { DeleteModal } from './components/modals/delete-modal';
import { ProjectFormModal } from './components/modals/project-form-modal';
import { api } from '@/lib/api';

interface Checklist {
  _id: string;
  name: string;
  customer: string;
  checklist_items: string[];
  created_by: string;
  allowed_users: string[];
  created_at: string;
  updated_at: string;
  custom_fields: any[];
  progress_percentage: number;
}

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
  const [formData, setFormData] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        checklist_name: formData.name
      });

      if (response.status === 200) {
        await fetchChecklists(); // Refresh the list
        setShowCreateModal(false);
        setFormData({ name: '' });
      } else {
        throw new Error(response.message || 'Failed to create checklist');
      }
    } catch (err) {
      setError('Failed to create checklist');
      console.error('Error creating checklist:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (checklistId: string) => {
    router.push(`/audit/checklist?id=${checklistId}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.post<DeleteChecklistResponse>('/audit/v2/checklist/delete/', {
        checklist_id: id
      });

      if (response.status === 200) {
        await fetchChecklists(); // Refresh the list
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
            </div>
          </div>

          <ProjectsTable
            projects={checklists.map(checklist => ({
              id: checklist._id,
              name: checklist.name,
              created_at: new Date(checklist.created_at).toLocaleDateString(),
              updated_at: new Date(checklist.updated_at).toLocaleDateString(),
              items_count: checklist.checklist_items.length,
              progress_percentage: checklist.progress_percentage,
            }))}
            columns={[
              { id: 'name', name: 'Name' },
              { id: 'created_at', name: 'Created Date' },
              { id: 'updated_at', name: 'Last Updated' },
              { id: 'items_count', name: '# Tasks' },
              { id: 'progress_percentage', name: 'Progress' },
            ]}
            onEdit={(id) => setShowEditModal(id)}
            onDelete={(id) => setShowDeleteConfirm(id)}
            onProjectClick={handleProjectClick}
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
        project={showCreateModal ? formData : checklists.find(c => c._id === showEditModal) || {}}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(null);
          setFormData({ name: '' });
        }}
        onChange={(field, value) => {
          setFormData(prev => ({ ...prev, [field]: value }));
        }}
        onSubmit={handleCreateChecklist}
      />
    </div>
  );
}