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

interface Warehouse {
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
    // Simulated API call - replace with your actual API endpoint
    const fetchWarehouses = async () => {
      try {
        // const response = await fetch('your-api-endpoint');
        // const data = await response.json();
        // setWarehouses(data);
        
        // Simulated data
        setWarehouses([
          { id: "1", name: "FOV JOHOR BULKERS SDN. BHD., PASIR GUDANG" },
          { id: "2", name: "Warehouse B" },
          { id: "3", name: "Warehouse C" },
        ]);
      } catch (error) {
        console.error('Failed to fetch warehouses:', error);
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
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