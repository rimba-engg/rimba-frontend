'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Filter, Upload, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { YearSelector } from '@/components/selectors/year-selector';
import { Loader } from '@/components/ui/loader';
import AddContractModal from './components/AddContractModal';

interface Contract {
  id: string;
  contractNumber: string;
  month: string;
  product: string;
  allocated: boolean;
  buyer: string;
  seller: string;
  quantity: number;
  blQuantity: number;
  billOfLading: string;
  portOfLoading: string;
}

// New implementation that uses the ApiClient from lib/api.ts
const fetchContracts = async (year: string): Promise<Contract[]> => {
  console.log('Fetching contracts for year:', year);
  try {
    // Perform a GET request using the api singleton
    const response = await api.get<{
      status: string;
      message: string;
      data: {
        outgoing_contracts: any[];
        products: any;
        current_year: any;
        YEARS: any;
      };
    }>(`/v2/contracts/outgoing/?current_year=${year}`);

    if (response.status !== 'success') {
      throw new Error(response.message || 'Failed to fetch outgoing contracts');
    }

    // Map each contract object from the API response to the Contract type
    return response.data.outgoing_contracts.map(contract => ({
      id: contract.contract_id,
      contractNumber: contract.contract_number,
      month: contract.for_month,
      product: contract.product,
      allocated: contract.is_allocated === "true", // convert string "true"/"false" to boolean
      buyer: contract.buyer,
      seller: contract.seller,
      quantity: Number(contract.quantity) || 0,
      blQuantity: Number(contract.bl_quantity) || 0,
      billOfLading: contract.bill_of_lading,
      portOfLoading: contract.port_of_loading
    }));
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
};

type SortConfig = {
  key: keyof Contract | null;
  direction: 'asc' | 'desc';
};



export default function OutgoingPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    month: '',
    product: '',
    allocated: '',
    buyer: '',
    seller: '',
    portOfLoading: ''
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchContracts(selectedYear);
        setContracts(data);
      } catch (error) {
        const err = error as Error;
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Failed to fetch contracts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [selectedYear]);

  const handleSort = (key: keyof Contract) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedContracts = [...contracts].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortConfig.direction === 'asc'
        ? (aValue === bValue ? 0 : aValue ? 1 : -1)
        : (aValue === bValue ? 0 : aValue ? -1 : 1);
    }

    return 0;
  });

  const filteredContracts = sortedContracts.filter(contract => {
    const matchesSearch = Object.values(contract).some(value =>
      value !== undefined && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const contractValue = contract[key as keyof Contract];
      return contractValue !== undefined && contractValue.toString().toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  const handleContractClick = (contractId: string) => {
    router.push(`/library/outgoing-contract?id=${contractId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader text="Loading contracts..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Outgoing Contracts</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track outgoing contract submissions and allocations.
          </p>
        </div>
        <AddContractModal />
      </div>

      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <YearSelector 
                value={selectedYear}
                onValueChange={setSelectedYear}
                startYear={2023} // optional
                endYear={2026}   // optional
              />
              <Button variant="outline" className="ml-4">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>

            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('contractNumber')}
                      className="flex items-center gap-1"
                    >
                      Contract Number
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('month')}
                      className="flex items-center gap-1"
                    >
                      Month
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('product')}
                      className="flex items-center gap-1"
                    >
                      Product
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('allocated')}
                      className="flex items-center gap-1"
                    >
                      Allocated
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('buyer')}
                      className="flex items-center gap-1"
                    >
                      Buyer
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('seller')}
                      className="flex items-center gap-1"
                    >
                      Seller
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('quantity')}
                      className="flex items-center gap-1"
                    >
                      Quantity
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('blQuantity')}
                      className="flex items-center gap-1"
                    >
                      BL Quantity
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('billOfLading')}
                      className="flex items-center gap-1"
                    >
                      Bill of Lading
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('portOfLoading')}
                      className="flex items-center gap-1"
                    >
                      Port of Loading
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-muted/50">
                    <TableCell>
                      <button
                        onClick={() => handleContractClick(contract.id)}
                        className="text-primary hover:underline"
                      >
                        {contract.contractNumber}
                      </button>
                    </TableCell>
                    <TableCell>{contract.month}</TableCell>
                    <TableCell>{contract.product}</TableCell>
                    <TableCell>
                      <Badge
                        variant={contract.allocated ? "default" : "secondary"}
                        className="font-medium"
                      >
                        {contract.allocated ? 'YES' : 'TBD'}
                      </Badge>
                    </TableCell>
                    <TableCell>{contract.buyer}</TableCell>
                    <TableCell>{contract.seller}</TableCell>
                    <TableCell>{contract.quantity.toLocaleString()}</TableCell>
                    <TableCell>{contract.blQuantity.toLocaleString()}</TableCell>
                    <TableCell>{contract.billOfLading}</TableCell>
                    <TableCell>{contract.portOfLoading}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}