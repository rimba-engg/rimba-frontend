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
  is_rng_customer: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
    customers: Customer[];
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

export interface SelectCustomerResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: User;
    customer: Customer;
    tokens: {
      access: string;
      refresh: string;
    };
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

export interface Checklist {
  _id: string;
  checklist_name: string;
  checklist_items: Array<ChecklistItem>;
  created_by: User;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  status: string;
  assigned_users: Array<User>;
  created_by: User;
}

export interface Comment {
  id: number;
  text: string;
  user: string;
  timestamp: string;
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

export interface ExtendedChecklistItem {
  id: string;
  issueNumber: string;
  description: string;
  documentRef: string;
  standardRef: string;
  auditorComment: string;
  classification: 'Non-conformance' | 'Misstatement' | null;
  brightmarkComment: string;
  createdBy: User | null;
  status: TaskStatus;
  assignedTo?: string;
  assignedToUser?: User;
  comments: Comment[];
  customFields: Record<string, string>;
  documents: Document[];
}

export interface FormData {
  issueNumber: string;
  description: string;
  documentRef: string;
  standardRef: string;
  auditorComment: string;
  classification: 'Non-conformance' | 'Misstatement' | null;
  brightmarkComment: string;
}

export interface CustomColumn {
  id: string;
  name: string;
}

// Project Types
export interface Project {
  _id: string;
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