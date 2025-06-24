import React, { useState } from 'react';
import { Thread } from '../types/chat';
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onUpdateThread: (threadId: string, updates: Partial<Thread>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  onUpdateThread
}) => {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditTitle(thread.title);
  };

  const saveEdit = () => {
    if (editingThreadId && editTitle.trim()) {
      onUpdateThread(editingThreadId, { title: editTitle.trim() });
    }
    setEditingThreadId(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingThreadId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button 
          onClick={onCreateThread}
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
              thread.id === activeThreadId 
                ? 'bg-blue-50 border border-blue-200' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectThread(thread.id)}
          >
            <div className="flex items-start gap-2">
              <MessageSquare size={16} className="mt-1 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {editingThreadId === thread.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-6 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={saveEdit} className="h-6 w-6 p-0">
                      <Check size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-6 w-6 p-0">
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {thread.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(thread.updatedAt)} • {thread.messages.length} messages
                    </div>
                  </>
                )}
              </div>
              
              {editingThreadId !== thread.id && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(thread);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 size={12} />
                  </Button>
                  {threads.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};