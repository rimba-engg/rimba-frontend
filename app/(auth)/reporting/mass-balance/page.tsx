'use client';

import { useState, useEffect } from 'react';
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
import { MassBalanceTable,MassBalanceData } from '@/app/(auth)/reporting/mass-balance/components/MassBalanceTable';
import { ProductSelect } from '@/app/(auth)/reporting/mass-balance/components/ProductSelect';
import { api,BASE_URL } from '@/lib/api';

interface MassBalanceResponse {
  status: string;
  message: string;
  data: {
    REVIEW_DOCS: any[];
    mass_balance: MassBalanceData[];
    customer:string;
  };
}

export interface ProductSummaryResponse {
  status: string;
  data: {
    products: ProductSummary[];
  };
  message: string;
}

export interface ProductSummary {
  name: string;
  INCOMING: number;
  PARTIAL_OUTGOING: number;
  OUTGOING: number;
}

export default function MassBalancePage() {
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [massBalanceData, setMassBalanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ProductSummary[]>([]);
  const years = ["2023", "2024", "2025", "2026"];

  const fetchMassBalance = async () => {
    setLoading(true);
    console.log(selectedProduct, selectedYear, selectedWarehouses);
    try {
      const params = new URLSearchParams({
        product_id: selectedProduct.join(','),
        warehouse_ids: selectedWarehouses.join(','),
        current_year: selectedYear,
      });
      console.log(params);
      const response = await api.get<MassBalanceResponse>(`/v2/mass-balance/overall/?${params}`);
      console.log("response.status", response.status);
      console.log("response.data", response.data);
      console.log("response.data.mass_balance", response.data.mass_balance);
      if (response.status === 'success') {
        console.log("inside sucess");
        console.log(response.data);
        const responseData = response.data.mass_balance;
        console.log("data is here");
        console.log(responseData);
        const MassBalance: MassBalanceData[] = responseData.map((massBalance: any) => ({
          month: massBalance.month,
          year: massBalance.year,
          OpeningStock: massBalance.OpeningStock,
          IncomingStock: massBalance.IncomingStock,
          OutgoingStock: massBalance.OutgoingStock,
          ClosingStock: massBalance.ClosingStock,
          PhysicalStock: massBalance.PhysicalStock ?? 0,
          Losses: massBalance.Losses ?? 0,
        }));
        console.log("mass balance data is here");
        console.log(MassBalance);
        setMassBalanceData(MassBalance);
      }
    } catch (error) {
      console.error('Error fetching mass balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMassBalanceStats = async () => {
    try {
      const params = new URLSearchParams({
        current_year: selectedYear,
        warehouse_ids: selectedWarehouses.join(','),
      });

      const response = await api.get<ProductSummaryResponse>(`/v2/product-summary/?${params}`);
      if (response.status === 'success') {
        setStats(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  useEffect(() => {
    // Check if dropdowns have been initialized with their default values
    if (selectedProduct.length > 0 && selectedYear && selectedWarehouses.length > 0) {
      fetchMassBalance();
    }
  }, [selectedProduct, selectedYear, selectedWarehouses]); // Dependencies ensure this runs when dropdowns change

  useEffect(() => {
    if (selectedYear && selectedWarehouses.length > 0) {
      fetchMassBalanceStats();
    }
  }, [selectedYear, selectedWarehouses]);

  const handleExportMassBalance = async () => {
    try {
      setLoading(true);
      console.log('Exporting mass balance data for:', selectedProduct, selectedYear, selectedWarehouses);

      const params = new URLSearchParams({
        product_id: selectedProduct.join(','),
        warehouse_ids: selectedWarehouses.join(','),
        current_year: selectedYear,
      });

      const response = await fetch(`${BASE_URL}/v2/mass-balance/download/?${params}`, { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MassBalance_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export mass balance data');
    } finally {
      setLoading(false);
    }
  };

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
        <div>
          <Button variant="outline" onClick={handleExportMassBalance}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8",
        "motion-safe:animate-[slideUp_0.3s_ease-out]"
      )}>
        <div className="flex space-x-4 items-center">
          <div className="space-y-4">
            <label className="text-sm font-medium">Product</label>
            <ProductSelect 
              selectedProducts={selectedProduct}
              onProductsChange={setSelectedProduct}
            />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-medium">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
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
          <div className="space-y-4">
            <label className="text-sm font-medium">Filter</label>
            <Button variant="outline" size="icon" className="text-green-500" onClick={fetchMassBalance}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <MassBalanceStats stats={stats} />

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
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="spinner"></div>
              <span className="ml-2">Loading mass balance data...</span>
            </div>
          ) : (
            <MassBalanceTable data={massBalanceData} />
          )}
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

        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #4f46e5; /* Primary color */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}