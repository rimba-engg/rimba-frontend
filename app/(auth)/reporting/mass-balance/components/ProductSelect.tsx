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

export interface Product {
  id: string;
  name: string;
}

interface ProductSelectProps {
  selectedProducts: string[];
  onProductsChange: (products: string[]) => void;
}

export const ProductSelect = ({ selectedProducts, onProductsChange }: ProductSelectProps) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<Product[]>('/v2/products/');
        if ((response as any).status === 'success') {
          const doc = (response as any).data;
          const Products: Product[] = doc.map((product: Product) => ({
            id: product.id,
            name: product.name,
          }));
          setProducts(Products);

          if (selectedProducts.length === 0 && Products.length > 0) {
            onProductsChange([Products[0].id]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, [onProductsChange, selectedProducts]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-48 justify-between"
        >
          {selectedProducts.length === 0
            ? "Select a product..."
            : `${products.find(product => product.id === selectedProducts[0])?.name || "Select a product..."}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandEmpty>No product found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                onSelect={() => {
                  const newSelected = selectedProducts.includes(product.id)
                    ? []
                    : [product.id];
                  onProductsChange(newSelected);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedProducts.includes(product.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {product.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};