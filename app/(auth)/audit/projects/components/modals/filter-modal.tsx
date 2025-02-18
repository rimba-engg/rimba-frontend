'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FilterModalProps {
  isOpen: boolean;
  filters: {
    name: string;
    verifier: string;
    afpRound: string;
    year: string;
  };
  onClose: () => void;
  onFilterChange: (field: string, value: string) => void;
  onApply: () => void;
}

export function FilterModal({
  isOpen,
  filters,
  onClose,
  onFilterChange,
  onApply,
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filter Projects</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Filter by project name"
            value={filters.name}
            onChange={(e) => onFilterChange('name', e.target.value)}
          />
          <Input
            type="text"
            placeholder="Filter by verifier"
            value={filters.verifier}
            onChange={(e) => onFilterChange('verifier', e.target.value)}
          />
          <Input
            type="text"
            placeholder="Filter by AFP round"
            value={filters.afpRound}
            onChange={(e) => onFilterChange('afpRound', e.target.value)}
          />
          <Input
            type="text"
            placeholder="Filter by year"
            value={filters.year}
            onChange={(e) => onFilterChange('year', e.target.value)}
          />
          <Button
            onClick={onApply}
            className="w-full bg-[#1B4D3E] text-white hover:bg-[#163B30]"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}