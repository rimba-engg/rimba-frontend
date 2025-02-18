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
  status?: string; // Add status field
}

export interface Column {
  id: keyof Project | 'status';
  name: string;
}

export const columns: Column[] = [
  { id: 'name', name: 'Name' },
  { id: 'created_at', name: 'Created Date' },
  { id: 'updated_at', name: 'Last Updated' },
  { id: 'checklist_items', name: '# Tasks' },
  { id: 'status', name: 'Status' },
];