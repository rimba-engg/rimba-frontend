'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  project: string;
  checklist_details: Array<{ id: string; name: string }>;
  status: 'Active' | 'Inactive';
  avatar?: string;
}

interface UserListResponse {
  data: {
    active_users: UserData[];
    inactive_users: UserData[];
  }
}

const emptyUser: Omit<UserData, 'id' | 'status'> = {
  name: '',
  email: '',
  role: 'USER',
  project: '',
  checklist_details: [],
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState(emptyUser);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<UserListResponse>('/user-mgt/v2/list-details/');
      console.log(response);
      // Combine active and inactive users
      setUsers([...response?.data?.active_users, ...response?.data?.inactive_users]);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof emptyUser, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users/', formData);
      }
      
      await fetchUsers(); // Refresh the user list
      handleCloseModal();
    } catch (err) {
      setError(editingUser ? 'Failed to update user' : 'Failed to create user');
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      project: user.project,
      checklist_details: user.checklist_details,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers(); // Refresh the user list
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'AUDITOR':
        return 'bg-purple-100 text-purple-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Project</th>
                  <th className="text-left py-3 px-4">Allowed Checklists</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-muted px-2 py-1 rounded text-sm">
                        {user.project || 'No Project'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.checklist_details.map((checklist) => (
                          <span
                            key={checklist.id}
                            className="bg-muted px-2 py-1 rounded-full text-xs"
                          >
                            {checklist.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowDeleteModal(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="AUDITOR">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Save Changes' : 'Add User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteModal)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}