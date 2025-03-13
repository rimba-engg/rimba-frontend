'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Grid, RefreshCw } from 'lucide-react';
import { AllChecklistTable } from './components/projects-table';
import { DeleteModal } from './components/modals/delete-modal';
import { ProjectFormModal } from './components/modals/project-form-modal';
import { AddColumnModal } from './components/modals/add-column-modal';
import { api } from '@/lib/api';
import { type ColumnSchema, type Checklist } from '@/lib/types';
import { AllChecklistSidebar } from './components/checklist-sidebar';

interface ChecklistResponse {
  data: {
    checklists: Checklist[];
    schema: ColumnSchema[];
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



const defaultColumns: ColumnSchema[] = [
  { id: 'name', name: 'Name', type: 'text' },
  { id: 'updated_at', name: 'Last Updated', type: 'date' },
  { id: 'items_count', name: '# Tasks', type: 'number' },
  { id: 'progress_percentage', name: 'Progress', type: 'number' },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showAllChecklistSidebar, setShowAllChecklistSidebar] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Checklist>({} as Checklist);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columns, setColumns] = useState<ColumnSchema[]>(defaultColumns);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchChecklists();
  }, []);

  // Clear success message timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const response = await api.get<ChecklistResponse>('/audit/v2/checklist');
      setColumns(response.data.schema);
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
      const payload = {
        checklist_name: formData.name,
        project_id: formData.project_id,
      };

      const response = await api.post<CreateChecklistResponse>(
        '/audit/v2/checklist/create/',
        payload
      );

      if (response.status === 200) {
        await fetchChecklists();
        setShowCreateModal(false);
        setFormData({
          id: '',
          name: '',
          project_id: '',
          checklist_items: [],
          created_by: JSON.parse(localStorage.getItem('user') || '{}'),
          updated_at: new Date().toISOString(),
        });
      } else {
        throw new Error(response.message || 'Failed to create checklist');
      }
    } catch (error) {
      console.error('Error creating checklist:', error);
      setError('Failed to create checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddColumn = async (columnData: ColumnSchema) => {
    try {
      const response = await api.post('/audit/v2/project/schema/add/', {
        name: columnData.name,
        field_type: columnData.type,
        options: columnData.options || []
      });

      setColumns(prev => [...prev, columnData]);
      setShowAddColumnModal(false);
    } catch (error) {
      console.error('Error adding column:', error);
      setError('Failed to add column');
    }
  };

  const handleChecklistClick = (checklistId: string) => {
    router.push(`/audit/checklist?id=${checklistId}`);
  };

  const handleEditClick = (id: string) => {
    const checklist = checklists.find(c => c.id === id);
    if (checklist) {
      setSelectedChecklist(checklist);
      setShowAllChecklistSidebar(true);
    }
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


  return (
    <div className="max-w-[calc(100vw-16rem)] mx-auto">
      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">All Checklists</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#163B30] transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                New Checklist
              </button>
              {/* removing add column for demo as backend is not ready */}
              <button
                onClick={() => setShowAddColumnModal(true)}
                className="bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#163B30] transition-colors flex items-center gap-2"
              >
                <Grid size={16} />
                Add Column
              </button>
            </div>
          </div>

          <AllChecklistTable
            projects={checklists}
            columns={columns}
            onEdit={handleEditClick}
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

      <AddColumnModal
        isOpen={showAddColumnModal}
        onClose={() => setShowAddColumnModal(false)}
        onSubmit={handleAddColumn}
      />

      {showAllChecklistSidebar && selectedChecklist && (
        <AllChecklistSidebar
          checklist={selectedChecklist}
          columns={columns}
          onClose={() => setShowAllChecklistSidebar(false)}
          reloadChecklists={fetchChecklists}
        />
      )}
    </div>
  );
}