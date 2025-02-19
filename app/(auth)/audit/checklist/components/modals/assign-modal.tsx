'use client';

import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { type User } from '@/lib/types';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string) => void;
  users: User[];
}

export function AssignModal({
  isOpen,
  onClose,
  onAssign,
  users,
}: AssignModalProps) {
  if (!isOpen) return null;

  return (
    <div className="!mt-0 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Assign Task</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="space-y-2">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onAssign(user.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + " " + user.last_name)}&background=random`}
                alt={user.first_name + " " + user.last_name}
                className="w-8 h-8 rounded-full"
              />
              <span className="flex-1 text-left">{user.first_name}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}