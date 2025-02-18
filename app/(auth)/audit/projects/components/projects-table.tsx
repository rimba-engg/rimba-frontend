'use client';

import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ChevronRight } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  items_count: number;
  status: string;
}

interface Column {
  id: keyof Project;
  name: string;
}

interface ProjectsTableProps {
  projects: Project[];
  columns: Column[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onProjectClick: (id: string) => void;
}

export function ProjectsTable({
  projects,
  columns,
  onEdit,
  onDelete,
  onProjectClick,
}: ProjectsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.id} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.name}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onProjectClick(project.id)}
                    className="group flex items-center gap-1 text-primary hover:text-primary/80"
                  >
                    <span className="font-medium">{project.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 -ml-1 transition-all group-hover:opacity-100 group-hover:ml-0" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.updated_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.items_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onEdit(project.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(project.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}