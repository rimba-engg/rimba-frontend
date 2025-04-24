import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface FilterButtonProps {
  label: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label }) => {
  return (
    <Button variant="outline" className="text-sm">
      {label}
      <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default FilterButton;