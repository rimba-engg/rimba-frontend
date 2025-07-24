'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { UserFormModal } from './components/user-form-modal';
import { DeleteUserModal } from './components/delete-user-modal';
import { UsersTable } from './components/users-table';
import { type Checklist } from '@/lib/types';
import { type UserData, type Project, type UserFormData, type UserListResponse, type ProjectListResponse, type ChecklistListResponse } from './types';

const emptyUser: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  role: 'USER',
  project: '',
  password: '',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyUser);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchChecklists();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<UserListResponse>('/user-mgt/v2/list-details/');
      setUsers([...response?.data?.active_users, ...response?.data?.inactive_users]);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get<ProjectListResponse>('/audit/v2/projects/');
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchChecklists = async () => {
    try {
      const response = await api.get<ChecklistListResponse>('/audit/v2/checklist/');
      setChecklists(response.data.checklists);
    } catch (err) {
      console.error('Error fetching checklists:', err);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingUser) {
        await api.put(`/user-mgt/v2/user/${editingUser.id}/`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role_name: formData.role,
          project: projects.find(proj => proj.name === formData.project)?.id,
        });
      } else {
        await api.post('/user-mgt/v2/user/', {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role_name: formData.role,
          project: projects.find(proj => proj.name === formData.project)?.id,
        });
      }
      
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      setError(editingUser ? 'Failed to update user' : 'Failed to create user');
      console.error('Error saving user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      project: user.project || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/user-mgt/v2/user/${id}/`);
      await fetchUsers();
      setShowDeleteModal(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[calc(100vw-16rem)] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user access and permissions across your organization.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <UsersTable
            users={users}
            onEdit={handleEdit}
            onDelete={(id) => setShowDeleteModal(id)}
          />
        </div>
      </div>

      <UserFormModal
        isOpen={showModal}
        mode={editingUser ? 'edit' : 'create'}
        formData={formData}
        projects={projects}
        checklists={checklists}
        onClose={handleCloseModal}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <DeleteUserModal
        isOpen={showDeleteModal !== null}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => handleDelete(showDeleteModal!)}
      />
    </div>
  );
}