'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, User2, Upload, FileText, Trash2, Download } from 'lucide-react';
import { TaskStatus, type ChecklistItem, type ColumnSchema, type User } from '@/lib/types';
import { api } from '@/lib/api';

interface TaskSidebarProps {
  task: ChecklistItem;
  schema?: ColumnSchema[];
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAssign: (id: string) => void;
  onDelete: (id: string) => void;
  onAddComment: (id: string) => void;
  onCustomFieldChange: (itemId: string, columnId: string, value: string) => void;
  newComment: string;
  onNewCommentChange: (value: string) => void;
}

export function TaskSidebar({
  task,
  schema = [],
  onClose,
  onStatusChange,
  onAssign,
  onDelete,
  onAddComment,
  onCustomFieldChange,
  newComment,
  onNewCommentChange,
}: TaskSidebarProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return null;
        }
        return prev + 10;
      });
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  // // TODO: Add support for all columns
  // const handleSave = async () => {
  //   setIsSaving(true);
  //   try {
  //     const response = await api.post<ChecklistItem>('/audit/v2/checklist/item/update/', {
  //       item_id: task.id,
  //       column_data: task.column_data,
  //     });

  //     if (response.status === 200) {
  //       task.column_data = column_data;
  //       setIsEditing(false);
  //     } else {
  //       console.error('Failed to update');
  //     }
  //   } catch (error) {
  //     console.error('Error updating:', error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const renderFieldInput = (column: ColumnSchema) => {
    const value = task.column_data[column.name] || '';

    switch (column.type) {
      case 'user':
        const user: User = task.column_data[column.name] || {};
        return (
          <button
            onClick={() => onAssign(task.id)}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-left"
          >
            {user ? (
              <>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=random`}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full"
                />
                <span>{user?.first_name}</span>
              </>
            ) : (
              <>
                <User2 className="w-5 h-5" />
                <span>Assign</span>
              </>
            )}
          </button>
        );
      case 'single_select':
      case 'multi_select':
        return (
          <select
            value={value}
            onChange={(e) => onCustomFieldChange(task.id, column.name, e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border"
            multiple={column.type === 'multi_select'}
          >
            <option value="">Select...</option>
            {column.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => onCustomFieldChange(task.id, column.name, e.target.value)}
            className="mt-1"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onCustomFieldChange(task.id, column.name, e.target.value)}
            className="mt-1"
          />
        );
      default:
        return (
          <Textarea
            value={value}
            onChange={(e) => onCustomFieldChange(task.id, column.name, e.target.value)}
            className="mt-1"
            rows={3}
          />
        );
    }
  };

  return (
    <div className="!mt-0 fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-200 ease-in-out flex flex-col">
      {/* Fixed Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-lg font-semibold">Task Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">

          {/* Custom Fields from Schema */}
          {schema.map((column) => (
            <div key={column.name}>
              <Label>{column.name}</Label>
              {renderFieldInput(column)}
            </div>
          ))}

          {/* Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Supporting Documents</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <div className="space-y-2">
              {task.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Comments</Label>
            <div className="mt-2 space-y-4">
              {task.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop"
                      alt={comment.user}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">{comment.user}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => onNewCommentChange(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                />
                <Button
                  onClick={() => onAddComment(task.id)}
                  className="self-end"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUploadModal(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-2">
                  Drag and drop your files here, or click to browse
                </p>
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Browse Files
                </Button>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button>Upload</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Delete Task</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
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