import { type Checklist } from '@/lib/types';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  project: string;
  checklist_details: Array<{ id: string; name: string }>;
  status: 'Active' | 'Inactive';
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  value: string;
}

export interface UserListResponse {
  data: {
    active_users: UserData[];
    inactive_users: UserData[];
  }
}

export interface ProjectListResponse {
  data: Project[];
}

export interface ChecklistListResponse {
  data: {
    checklists: Checklist[];
  }
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  project: string;
  checklist_details: Array<{ id: string; name: string }>;
}