'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter, ArrowDownUp, Clock, ChevronUp, ChevronDown, Package, PlusCircle, MinusCircle, ArrowRightLeft, Scale, Warehouse } from 'lucide-react';
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
import { api } from '@/lib/api';
import { months, years } from '@/lib/constants';
import { useRouter } from 'next/navigation';

// Define the types based on the mock data structure
interface InventoryItem {
  product: string;
  storage: string;
  month: number;
  year: number;
  opening: number;
  incoming: number;
  outgoing: number;
  closing: number;
  product_id: string;
  storage_id: string;
}

interface StorageInventoryResponse {
  success: string;
  data: {
    mass_balance: {
      [storageLocation: string]: InventoryItem[];
    };
  };
  message: string;
}

export default function StorageInventoryPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("2");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [inventoryData, setInventoryData] = useState<{[storageLocation: string]: InventoryItem[]}>({});
  const [expandedLocations, setExpandedLocations] = useState<{[key: string]: boolean}>({});
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get<StorageInventoryResponse>(
        `/v2/mass-balance/storage/?current_month=${selectedMonth}&current_year=${selectedYear}`
      );
      
      const responseData = response.data;
      
      if (response.success === "success") {
        setInventoryData(responseData.mass_balance);
        
        // Initialize all locations as expanded
        const initialExpandedState: {[key: string]: boolean} = {};
        Object.keys(responseData.mass_balance).forEach(location => {
          initialExpandedState[location] = true;
        });
        setExpandedLocations(initialExpandedState);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect dependencies to include filters
  useEffect(() => {
    fetchInventoryData();
  }, [selectedMonth, selectedYear]);

  const containerClasses = cn(
    "container mx-auto px-4 py-4 w-[85vw] space-y-4",
    "transition-all duration-500 ease-out"
  );

  // Filter products that have non-zero values for display
  // const filterNonZeroProducts = (items: InventoryItem[]) => {
  //   return items.filter(item => 
  //     item.opening !== 0 || 
  //     item.incoming !== 0 || 
  //     item.outgoing !== 0 || 
  //     item.closing !== 0
  //   );
  // };

  // Toggle expanded state for a location
  const toggleLocationExpanded = (location: string) => {
    setExpandedLocations(prev => ({
      ...prev,
      [location]: !prev[location]
    }));
  };

  // Get storage location background color based on location name
  const getStorageLocationColor = (location: string) => {
    const colors = {
      'FGV BULKERS SDN BHD': 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500',
      'FGV JOHOR BULKERS SDN. BHD.': 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500',
      'LANGSAT BULKERS SDN. BHD.': 'bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500',
      'PACIFIC OIL & FATS INDUSTRIES': 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500'
    };
    
    return colors[location as keyof typeof colors] || 'bg-gray-50';
  };

  // Get color classes for values
  const getValueColorClass = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-500";
  };

  // Format number for display
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleIncomingClick = (item: InventoryItem) => {
    const params = new URLSearchParams({
      month: item.month.toString(),
      year: item.year.toString(),
      transaction_type: 'INCOMING',
      warehouses: item.storage_id,
      product: item.product_id
    });
    router.push(`/transactions?${params}`);
  };

  const handleOutgoingClick = (item: InventoryItem) => {
    const params = new URLSearchParams({
      month: item.month.toString(),
      year: item.year.toString(),
      transaction_type: 'PARTIAL_OUTGOING',
      warehouses: item.storage_id,
      product: item.product_id
    });
    router.push(`/transactions?${params}`);
  };

  return (
    <div className={containerClasses}>
      <div className="bg-gradient-to-r from-[#f0faf8] to-[#f6fbf9] p-6 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Storage Inventory Tracking</h1>
          <p className="text-sm text-gray-600">Monitor and manage your storage locations' inventory balances</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" /> 
              <label className="text-sm font-medium text-gray-700">Period</label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] bg-white border-gray-200 hover:border-gray-300 focus:ring-emerald-500">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] bg-white border-gray-200 hover:border-gray-300 focus:ring-emerald-500">
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
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="bg-white shadow-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              onClick={fetchInventoryData}
            >
              <ArrowDownUp className="h-4 w-4 mr-2 text-gray-600" />
              Refresh
            </Button>
            
            {/* <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={() => console.log("Export data")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button> */}
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="flex justify-center items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                Loading inventory data...
              </div>
            </div>
          ) : Object.entries(inventoryData).map(([storageLocation, items]) => {
            // const filteredItems = filterNonZeroProducts(items);
            const filteredItems = items;
            if (filteredItems.length === 0) return null;
            const isExpanded = expandedLocations[storageLocation] || false;

            return (
              <div key={storageLocation} className="animate-fade-in">
                <div 
                  className={cn(
                    "p-4 rounded-t-lg flex items-center justify-between cursor-pointer transition-colors",
                    getStorageLocationColor(storageLocation),
                    isExpanded ? "" : "rounded-b-lg"
                  )}
                  onClick={() => toggleLocationExpanded(storageLocation)}
                >
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-5 w-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-800">{storageLocation}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {filteredItems.length} products
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="rounded-b-lg border border-t-0 border-gray-200 overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Product
                              </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center justify-end gap-2">
                                <Clock className="h-4 w-4" />
                                Opening
                              </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center justify-end gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Incoming
                              </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center justify-end gap-2">
                                <MinusCircle className="h-4 w-4" />
                                Outgoing
                              </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center justify-end gap-2">
                                <ArrowRightLeft className="h-4 w-4" />
                                Closing
                              </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center justify-end gap-2">
                                <Scale className="h-4 w-4" />
                                Physical Stock
                              </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Losses
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredItems.map((item, index) => {
                            const rowId = `${item.storage_id}-${item.product_id}`;
                            const isHovered = hoveredRow === rowId;
                            
                            return (
                              <tr 
                                key={index} 
                                className={cn(
                                  "transition-colors",
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                                  isHovered ? 'bg-blue-50' : ''
                                )}
                                onMouseEnter={() => setHoveredRow(rowId)}
                                onMouseLeave={() => setHoveredRow(null)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.product}
                                </td>
                                <td className={cn(
                                  "px-6 py-4 whitespace-nowrap text-sm text-right",
                                  getValueColorClass(item.opening)
                                )}>
                                  {formatNumber(item.opening)}
                                </td>
                                <td className={cn(
                                  "px-6 py-4 whitespace-nowrap text-sm text-right cursor-pointer hover:underline",
                                  getValueColorClass(item.incoming)
                                )}
                                onClick={() => handleIncomingClick(item)}
                                >
                                  {formatNumber(item.incoming)}
                                </td>
                                <td className={cn(
                                  "px-6 py-4 whitespace-nowrap text-sm text-right cursor-pointer hover:underline",
                                  getValueColorClass(item.outgoing)
                                )}
                                onClick={() => handleOutgoingClick(item)}
                                >
                                  {formatNumber(item.outgoing)}
                                </td>
                                <td className={cn(
                                  "px-6 py-4 whitespace-nowrap text-sm text-right font-medium",
                                  getValueColorClass(item.closing)
                                )}>
                                  {formatNumber(item.closing)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                  0.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                  0.00
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}