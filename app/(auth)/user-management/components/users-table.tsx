'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type UserData } from '../types';
import { getStoredCustomer } from '@/lib/auth';

interface UsersTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  const customer = getStoredCustomer();
  const customerName = customer?.name;

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

  return (
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
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=random`}
                    alt={user.first_name + ' ' + user.last_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{user.first_name + ' ' + user.last_name}</div>
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
                {user.role === 'ADMIN' && customerName === 'Brightmark' ? (
                  <div className="flex flex-wrap gap-1">
                    {['US GAIN', 'CHEVRON'].map((project, index) => (
                      <span
                        key={index}
                        className="bg-muted px-2 py-1 rounded-full text-xs"
                      >
                        {project}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="bg-muted px-2 py-1 rounded text-sm">
                    {user.project || 'No Project'}
                  </span>
                )}
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
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user.id)}
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
  );
}