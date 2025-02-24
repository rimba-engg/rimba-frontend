'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, User2, Upload, FileText, Trash2, Download } from 'lucide-react';
import { Customer, TaskStatus, type Checklist, type ChecklistItem, type ColumnSchema, type User } from '@/lib/types';
import { api } from '@/lib/api';
import { BASE_URL } from '@/lib/api';
import { getStoredCustomer } from '@/lib/auth';
interface TaskSidebarProps {
  task: ChecklistItem;
  checklistData: Checklist;
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

interface UserResponse {
  active_users: User[];
  inactive_users: User[];
}

export function TaskSidebar({
  task,
  checklistData,
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
  const [users, setUsers] = useState<User[]>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  useEffect(() => {
    const customer = getStoredCustomer();
    setCustomerData(customer);
  }, []);

  const isAdmin = customerData?.role === 'ADMIN';
  useEffect(() => {
    // Load users when sidebar opens
    fetchUsers();
  }, [task.id]);

  const fetchUsers = async () => {
    try {
      const response = await api.get<UserResponse>(`/audit/v2/allowed_user_list/${checklistData.id}/`);
      setUsers(response.active_users);
      console.log(response.active_users);
      console.log('users set');
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    onNewCommentChange(value);
    setCursorPosition(cursorPos);

    // Check if we should show user suggestions
    const lastAtSymbol = value.lastIndexOf('@', cursorPos);
    if (lastAtSymbol !== -1 && lastAtSymbol < cursorPos) {
      const query = value.slice(lastAtSymbol + 1, cursorPos);
      setUserQuery(query);
      setShowUserSuggestions(true);
    } else {
      setShowUserSuggestions(false);
    }
  };

  const insertMention = (user: User) => {
    if (!cursorPosition) return;

    const beforeMention = newComment.slice(0, cursorPosition - userQuery.length - 1);
    const afterMention = newComment.slice(cursorPosition);
    const mention = `@${user.first_name} ${user.last_name}`;
    
    const newValue = `${beforeMention}${mention}${afterMention}`;
    onNewCommentChange(newValue);
    setShowUserSuggestions(false);
    
    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = beforeMention.length + mention.length;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post('/audit/v2/add_checklist_comment/', {
        comment: newComment,
        checklist_item_id: task.id
      });
      
      onAddComment(task.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('item_id', task.id);
      Array.from(files).forEach(file => {
        formData.append('documents', file);
      });

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/audit/v2/checklist/item/file/upload/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }
      
      // Close modal and reset state
      setShowUploadModal(false);
      setUploadProgress(null);
      
      // You might want to refresh the document list here
      // Consider adding a state update or callback prop for document refresh

    } catch (error) {
      console.error('Error uploading files:', error);
    }
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

  const renderFieldInput = (column: ColumnSchema) => {
    const value = task.column_data[column.name] || '';
    // Determine if the field is editable: if not provided, then it is editable.
    const isEditable = !column.editable || (column.editable === 'ADMIN' && isAdmin);

    switch (column.type) {
      case 'user': {
        const user: User = task.column_data[column.name] || {};
        if (isEditable) {
          return (
            <button
              onClick={() => onAssign(task.id)}
              className="mt-1 w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-left"
            >
              {user && user.id ? (
                <>
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=random`}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{user.first_name}</span>
                </>
              ) : (
                <>
                  <User2 className="w-5 h-5" />
                  <span>Assign</span>
                </>
              )}
            </button>
          );
        } else {
          return (
            <div className="mt-1 w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-left">
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User2 className="w-5 h-5" />
              )}
              {user && user.first_name ? user.first_name : "Assign"}
            </div>
          );
        }
      }
      case 'single_select':
      case 'multi_select':
        return (
          <select
            value={value}
            onChange={(e) => onCustomFieldChange(task.id, column.name, e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border"
            multiple={column.type === 'multi_select'}
            disabled={!isEditable}
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
            disabled={!isEditable}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onCustomFieldChange(task.id, column.name, e.target.value)}
            className="mt-1"
            disabled={!isEditable}
          />
        );
      default:
        return (
          <Textarea
            value={value}
            onChange={(e) => onCustomFieldChange(task.id, column.name, e.target.value)}
            className="mt-1"
            rows={3}
            readOnly={!isEditable}
          />
        );
    }
  };

  console.log(users);

  return (
    <div className="!mt-0 fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-200 ease-in-out flex flex-col">
      {/* Fixed Header */}
      <div className="flex justify-end items-center p-1 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">

          {/* Custom Fields from Schema */}
          {schema.filter(column => column.name !== 'Status').map((column) => (
            <div key={column.name}>
              <Label>{column.name}</Label>
              {renderFieldInput(column)}
            </div>
          ))}

          {/* Documents Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Supporting Documents</Label>
              <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <div className="space-y-2">
              {task.documents?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
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
                      alt={comment.user.first_name + ' ' + comment.user.last_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">
                      {comment.user.first_name + ' ' + comment.user.last_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.comment}</p>
                </div>
              ))}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Add a comment... Use @ to mention users"
                  className="mb-2"
                />
                
                {/* User Suggestions Dropdown */}
                {showUserSuggestions && (
                  <div className="absolute bottom-full left-0 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {users
                      .filter(user => 
                        `${user.first_name} ${user.last_name}`
                          .toLowerCase()
                          .includes(userQuery.toLowerCase())
                      )
                      .map(user => (
                        <button
                          key={user.id}
                          onClick={() => insertMention(user)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                        >
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=random`}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{user.first_name} {user.last_name}</span>
                        </button>
                      ))}
                  </div>
                )}
                
                <Button onClick={handleAddComment}>
                  Add Comment
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="destructive" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
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
              <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
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
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  Browse Files
                </Button>
              </div>

              {selectedFiles && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Selected files:
                  </div>
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="text-sm">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleFileUpload(selectedFiles)}>Upload</Button>
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
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}