'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Download, 
  Filter, 
  FileUp, 
  FilePlus, 
  ChevronDown, 
  ArrowUpDown, 
  CheckCircle, 
  XCircle,
  Calendar,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from '@/lib/api'; // Import the api module

// Define the contract data type based on the provided mock data
interface Contract {
  contract_number: string;
  start_date: string;
  end_date: string;
  expected_quantity: number;
  buyer: string;
  seller: string;
  place_of_loading: string;
  place_of_delivery: string;
  origin: string;
  invoice_number: string;
  id: string;
  for_month: string;
  product_name: string;
  certification_name: string;
  warehouses: string;
  received_quantity: number;
  available_quantity: number;
  difference: number;
}

interface IncomingContractResponse {
  status: string;
  message: string;
  data: {
    incoming_contracts: Contract[];
  };
}

export default function IncomingContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [sortBy, setSortBy] = useState<keyof Contract>("contract_number");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  
  // Available years for the dropdown
  const years = ["2023", "2024", "2025", "2026"];

  // Fetch contract data (mock data from the provided JSON)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data from the API with selected year as a query parameter
        const response = await api.get<IncomingContractResponse>(`/v2/contracts/incoming/?current_year=${selectedYear}`);
        if (response.status === 'success') {
          // Update state with the API data
          setContracts(response.data.incoming_contracts);
        } else {
          console.error('Failed to fetch contract data:', response.message);
        }
      } catch (error) {
        console.error('Failed to fetch contract data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // Filter contracts based on search query
  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contracts;
    }
    
    const query = searchQuery.toLowerCase();
    return contracts.filter(contract => 
      Object.values(contract).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(query)
      )
    );
  }, [contracts, searchQuery]);

  // Sort contracts based on the selected column and order
  const sortedContracts = useMemo(() => {
    return [...filteredContracts].sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      }
    });
  }, [filteredContracts, sortBy, sortOrder]);

  // Handle column sort
  const handleSort = (column: keyof Contract) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Handle row click to navigate to contract details
  const handleRowClick = (contract: Contract) => {
    const contract_id = contract.id;
    router.push(`/library/incoming-contract?contract_id=${contract_id}`);
  };

  // Helper function to format dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Format month for display
  const formatMonth = (date: string) => {
    const month = new Date(date).toLocaleString('default', { month: 'short' });
    const year = new Date(date).getFullYear().toString().slice(2);
    return `${month}-${year}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col space-y-4">
        {/* Header section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Incoming Contracts</h1>
            <p className="text-gray-600 mt-1">Manage and track incoming contract submissions and allocations.</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <FilePlus className="h-4 w-4 mr-2" />
              Add Contracts
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <FileUp className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
          </div>
        </div>

        {/* Filter and search section */}
        <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Year:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] bg-white border-gray-300">
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
            
            <Button variant="outline" className="bg-white border-gray-300 text-gray-700">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button variant="outline" className="bg-white border-gray-300 text-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Contracts table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <span className="ml-2 text-lg text-gray-600">Loading contracts...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Fixed contract number column */}
                    <th 
                      className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 z-10"
                      onClick={() => handleSort('contract_number')}
                    >
                      <div className="flex items-center">
                        Contract #
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    
                    {/* Other scrollable columns */}
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('for_month')}
                    >
                      <div className="flex items-center">
                        Month
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('product_name')}
                    >
                      <div className="flex items-center">
                        Product
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center justify-center">
                        Available
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('received_quantity')}
                    >
                      <div className="flex items-center justify-end">
                        Received QTY (MT)
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('expected_quantity')}
                    >
                      <div className="flex items-center justify-end">
                        Contract QTY (MT)
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('available_quantity')}
                    >
                      <div className="flex items-center justify-end">
                        Available QTY (MT)
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('start_date')}
                    >
                      <div className="flex items-center">
                        Start Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('end_date')}
                    >
                      <div className="flex items-center">
                        End Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('warehouses')}
                    >
                      <div className="flex items-center">
                        Warehouse
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('seller')}
                    >
                      <div className="flex items-center">
                        Seller
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('buyer')}
                    >
                      <div className="flex items-center">
                        Buyer
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedContracts.map((contract) => (
                    <tr 
                      key={contract.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(contract)}
                    >
                      {/* Fixed contract number column */}
                      <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border-r z-10 hover:bg-gray-50">
                        {contract.contract_number}
                      </td>
                      
                      {/* Other scrollable columns */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMonth(contract.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.product_name} :: {contract.certification_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {contract.available_quantity > 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {contract.received_quantity.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {contract.expected_quantity.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {contract.available_quantity.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(contract.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(contract.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.warehouses || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.seller}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.buyer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
