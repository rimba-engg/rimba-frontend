import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export interface Warehouse {
  id: string;
  name: string;
}

export interface WarehouseDropdownProps {
  warehouses: Warehouse[];
  selectedWarehouses: string[];
  onSelect: (warehouseId: string) => void;
}

const WarehouseDropdown: React.FC<WarehouseDropdownProps> = ({
  warehouses,
  selectedWarehouses,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">Select Warehouses To Allocate From:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {selectedWarehouses.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {warehouses
                  .filter((warehouse) => selectedWarehouses.includes(warehouse.id))
                  .map((warehouse) => (
                    <Badge
                      key={warehouse.id}
                      variant="outline"
                      className="flex items-center gap-1 z-50"
                    >
                      <span>{warehouse.name}</span>
                    </Badge>
                  ))}
              </div>
            ) : (
              'Select warehouses'
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {warehouses.map((warehouse) => (
            <DropdownMenuCheckboxItem
              key={warehouse.id}
              checked={selectedWarehouses.includes(warehouse.id)}
              onCheckedChange={() => onSelect(warehouse.id)}
              onSelect={(e) => e.preventDefault()}
            >
              {warehouse.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WarehouseDropdown; 