import { useState, useEffect } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from '@/lib/api';

export interface Warehouse {
  id: string;
  name: string;
}

interface WarehouseSelectProps {
  selectedWarehouses: string[];
  onWarehousesChange: (warehouses: string[]) => void;
}

export const WarehouseSelect = ({ selectedWarehouses, onWarehousesChange }: WarehouseSelectProps) => {
  const [open, setOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get<Warehouse[]>('/v2/warehouses/');
        if ((response as any).status === 'success') {
          const result = (response as any).data;
          const Warehouses: Warehouse[] = result.map((warehouse: Warehouse) => ({
            id: warehouse.id,
            name: warehouse.name,
          }));
          setWarehouses(Warehouses);

          // Set initial selected warehouses to all warehouse IDs
          const allWarehouseIds = Warehouses.map(warehouse => warehouse.id);
          onWarehousesChange(allWarehouseIds);
        }
      } catch (error) {
        console.error('Failed to fetch warehouses:', error);
      }
    };

    fetchWarehouses();
  }, [onWarehousesChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-48 justify-between"
        >
          {selectedWarehouses.length === 0
            ? "Select warehouses..."
            : `${selectedWarehouses.length} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search warehouses..." />
          <CommandEmpty>No warehouse found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {warehouses.map((warehouse) => (
              <CommandItem
                key={warehouse.id}
                onSelect={() => {
                  const newSelected = selectedWarehouses.includes(warehouse.id)
                    ? selectedWarehouses.filter((id) => id !== warehouse.id)
                    : [...selectedWarehouses, warehouse.id];
                  onWarehousesChange(newSelected);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedWarehouses.includes(warehouse.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {warehouse.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};