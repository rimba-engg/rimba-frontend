'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Download, 
  Filter, 
  FileUp, 
  FilePlus, 
  ArrowUpDown, 
  CheckCircle, 
  XCircle,
  Calendar,
  Loader2,
  FileText,
  Package,
  Scale,
  User,
  MapPin,
  Hash,
  FileDigit,
  Flag
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

import { api, BASE_URL } from '@/lib/api'; // Import the api module
import { Modal } from './components/modals/add_contract'; // Import the modal component
import { ProductSelect } from "../../reporting/mass-balance/components/ProductSelect";
import { Weight } from "lucide-react";


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

// Add this interface for the form data
interface ContractFormData {
  contract_number: string;
  product: string;
  expected_quantity: number;
  start_date: string;
  end_date: string;
  buyer: string;
  seller: string;
  place_of_loading: string;
  place_of_delivery: string;
  origin: string;
  invoice_number: string;
}

export default function IncomingContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [sortBy, setSortBy] = useState<keyof Contract>("contract_number");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Available years for the dropdown
  const years = ["2023", "2024", "2025", "2026"];

  // Add form state
  const [formData, setFormData] = useState<ContractFormData>({
    contract_number: '',
    product: '',
    expected_quantity: 0,
    start_date: '',
    end_date: '',
    buyer: '',
    seller: '',
    place_of_loading: '',
    place_of_delivery: '',
    origin: '',
    invoice_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`${BASE_URL}/v2/contracts/incoming/download/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incoming_contracts_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download contracts');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddContract = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Make sure at least one product is selected
      if (selectedProducts.length === 0) {
        throw new Error('Please select a product');
      }

      const payload = {
        ...formData,
        product: selectedProducts[0], 
        expected_quantity: parseFloat(formData.expected_quantity.toString())
      };

      const response = await api.post('/v2/contract/incoming/add/', payload);

      if ((response as any).status === 'success') {
        // Refresh the contracts list
        const updatedResponse = await api.get<IncomingContractResponse>(`/v2/contracts/incoming/?current_year=${selectedYear}`);
        if (updatedResponse.status === 'success') {
          setContracts(updatedResponse.data.incoming_contracts);
        }
        
        // Close modal and reset form
        setIsModalOpen(false);
        setFormData({
          contract_number: '',
          product: '',
          expected_quantity: 0,
          start_date: '',
          end_date: '',
          buyer: '',
          seller: '',
          place_of_loading: '',
          place_of_delivery: '',
          origin: '',
          invoice_number: ''
        });
        setSelectedProducts([]);
      } else {
        throw new Error((response as any).message || 'Failed to add contract');
      }
    } catch (error) {
      console.error('Failed to add contract:', error);
      alert(error instanceof Error ? error.message : 'Failed to add contract');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleTemplateDownload = async () => {
    try {
      const a = document.createElement('a');
      a.href = 'https://rimba-docs-testing.s3.us-west-1.amazonaws.com/uploads/incoming_contracts_final_format.xlsx';
      a.download = 'incoming_contracts_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Template download error:', error);
      alert('Failed to download template');
    }
  };

  // Add this function to handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('contract_type', "incoming");

    try {
      const response = await fetch(`${BASE_URL}/v2/contracts/bulk-upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      // Refresh the contracts list
      const updatedResponse = await api.get<IncomingContractResponse>(`/v2/contracts/incoming/?current_year=${selectedYear}`);
      if (updatedResponse.status === 'success') {
        setContracts(updatedResponse.data.incoming_contracts);
      }

      setIsUploadModalOpen(false);
      setUploadFile(null);
      alert('Contracts uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload contracts');
    } finally {
      setIsUploading(false);
    }
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
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleAddContract}>
              <FilePlus className="h-4 w-4 mr-2" />
              Add Contracts
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setIsUploadModalOpen(true)}
            >
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
            
            <Button 
              variant="outline" 
              className="bg-white border-gray-300 text-gray-700"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
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
                    <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 z-10 whitespace-nowrap"
                      onClick={() => handleSort('contract_number')}>
                      <div className="flex items-center">
                        Contract Number
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('for_month')}>
                      <div className="flex items-center">
                        Contract Month
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('product_name')}>
                      <div className="flex items-center">
                        Product
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        Availability Status
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('received_quantity')}>
                      <div className="flex items-center justify-end">
                        Received Quantity (Metric Tons)
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('expected_quantity')}>
                      <div className="flex items-center justify-end">
                        Contract Quantity (Metric Tons)
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('available_quantity')}>
                      <div className="flex items-center justify-end">
                        Available Quantity (Metric Tons)
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('start_date')}>
                      <div className="flex items-center">
                        Start Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('end_date')}>
                      <div className="flex items-center">
                        End Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('warehouses')}>
                      <div className="flex items-center">
                        Warehouse
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('seller')}>
                      <div className="flex items-center">
                        Seller
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('buyer')}>
                      <div className="flex items-center">
                        Buyer
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedContracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(contract)}>
                      <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border-r z-10 hover:bg-gray-50">
                        {contract.contract_number}
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this contract?")) {
                              try {
                                await api.post('/v2/incoming/contract/delete/', {
                                  contract_id: contract.id
                                });
                                setContracts(prev => prev.filter(c => c.id !== contract.id));
                              } catch (error) {
                                console.error('Failed to delete contract:', error);
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Add Incoming Contract</h2>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Contract Number
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={formData.contract_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_number: e.target.value }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 text-gray-500" />
                Product Selection
              </label>
              <ProductSelect
                selectedProducts={selectedProducts}
                onProductsChange={setSelectedProducts}
              />
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Scale className="h-4 w-4 text-gray-500" />
                Quantity Details
              </label>
              <div className="relative">
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.expected_quantity || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    expected_quantity: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </label>
                <Input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full bg-white border-gray-200 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </label>
                <Input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full bg-white border-gray-200 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                Buyer Information
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={formData.buyer}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyer: e.target.value }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                Seller Information
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={formData.seller}
                  onChange={(e) => setFormData(prev => ({ ...prev, seller: e.target.value }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                Place of Loading
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={formData.place_of_loading}
                  onChange={(e) => setFormData(prev => ({ ...prev, place_of_loading: e.target.value }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                Place of Delivery
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={formData.place_of_delivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, place_of_delivery: e.target.value }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Flag className="h-4 w-4" />
                Origin
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileDigit className="h-4 w-4" />
                Invoice Number
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={formData.invoice_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                  className="w-full pl-9 bg-white border-gray-200 focus:ring-blue-500"
                />
                <FileDigit className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Contract
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Bulk Upload Contracts</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <h3 className="font-semibold mb-2">Before uploading:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Please ensure your file follows the required format</li>
              <li>Only .xlsx files are supported</li>
              <li>All mandatory fields must be filled</li>
              <li className="text-green-700 font-semibold">Please check the template before uploading</li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTemplateDownload}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Excel File
              </label>
              <Input
                type="file"
                accept=".xlsx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                required
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={!uploadFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
