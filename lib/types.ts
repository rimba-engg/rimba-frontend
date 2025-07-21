// User and Auth Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  role: string;
  status?: 'ACTIVE' | 'INACTIVE';
  description?: string;
  address?: string;
  departments?: string[];
  billing_address?: string;
  websites?: string[];
}

export interface UserInfoResponse {
  user: User;
  customers: Customer[];
}

export interface SelectCustomerResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: User;
    customer: Customer;
  };
}

export interface ApiError {
  status: 'error';
  message: string;
  code?: string;
}

// Checklist Types
export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETE'
}

export interface ColumnSchema {
  id?: string;
  name: string;
  type: 'text' | 'single_select' | 'multi_select' | 'number' | 'date' | 'user';
  options?: Array<string>;
  editable?: string;
}

export interface ChecklistItem {
  id: string;
  status: TaskStatus;
  comments: Comment[];
  documents: Document[];
  schema?: Array<ColumnSchema>;
  column_data: Record<string, any>;
  assigned_user?: User;
}

export interface Checklist {
  id: string;
  name: string;
  checklist_items: Array<ChecklistItem>;
  created_by: User;
  updated_at: string;
  progress_percentage?: number;
  project_id: string;
  schema?: Array<ColumnSchema>;
  audit_year: string;
  additional_columns?: Array<ColumnSchema>;
  column_data?: Record<string, any>;
  site: string;
  allowed_users: User[];
}

export interface Comment {
  id: number;
  comment: string;
  user: User;
  created_at: string;
}

export interface Document {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface FormData {
  description: string;
}

export interface CustomColumn {
  id: string;
  name: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  customer: string;
  checklist_items: string[];
  created_by: string;
  allowed_users: string[];
  created_at: string;
  updated_at: string;
  custom_fields: any[];
  status?: string;
}

export interface Column {
  id: keyof Project | 'status';
  name: string;
}

export interface Notification {
  id: string;
  message: string;
  created_at: string;
  intent_type: string;
  status: 'READ' | 'UNREAD';
  type: 'success' | 'warning' | 'info';
  checklist_id?: string;
  reference_id?: string; // checklist_item_id or document_id
}