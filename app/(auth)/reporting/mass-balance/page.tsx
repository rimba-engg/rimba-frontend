'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search,Scale, Download, Filter } from 'lucide-react';

import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { WarehouseSelect } from '@/app/(auth)/reporting/mass-balance/components/WarehouseSelect';
import { MassBalanceStats } from '@/app/(auth)/reporting/mass-balance/components/MassBalanceStats';
import { MassBalanceTable } from '@/app/(auth)/reporting/mass-balance/components/MassBalanceTable';

export default function MassBalancePage() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);

  const years = ["2023", "2024", "2025", "2026"];
  const products = ["POME :: ISCC", "EFB :: ISCC", "PPF :: ISCC", "UCO :: ISCC"];

  const containerClasses = cn(
    "container mx-auto px-4 py-8 max-w-[1400px] space-y-6",
    "transition-all duration-500 ease-out",
    "motion-safe:animate-[fadeIn_0.5s_ease-out]"
  );

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mass Balance Overview</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your mass balance across multiple warehouses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8",
        "motion-safe:animate-[slideUp_0.3s_ease-out]"
      )}>
        <div className="space-y-4">
          <label className="text-sm font-medium">Product</label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product} value={product}>
                  {product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium">Warehouse</label>
          <WarehouseSelect 
            selectedWarehouses={selectedWarehouses}
            onWarehousesChange={setSelectedWarehouses}
          />
        </div>
      </div>

      <MassBalanceStats />

      <Card className={cn(
        "mt-8",
        "motion-safe:animate-[fadeIn_0.5s_ease-out_0.2s]"
      )}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <MassBalanceTable />
        </div>
      </Card>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}