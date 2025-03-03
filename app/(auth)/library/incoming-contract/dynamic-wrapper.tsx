'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  FileText,
  Building,
  Truck,
  MapPin,
  FileCheck,
  Tag,
  RefreshCcw,
  DollarSign,
  Flag,
  Package,
  Warehouse,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BarChart3,
  ShieldCheck,
  Clock,
  Search,
  AlertCircle,
  Edit,
  Save,
  Loader2,
  Network
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api, BASE_URL } from "@/lib/api";
import { useToast,toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

// Define API response types
interface AvailableProduct {
  id: string;
  name: string;
}

interface Contract {
  available_products: AvailableProduct[];
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
  for_month: number;
  for_year: number;
  product_name: string;
  certification_name: string;
  warehouses: string;
  received_quantity: number;
  available_quantity: number;
  difference: number;
  chosen_product_id: string;
  notes: string[];
}

interface WarehouseAllocation {
  _id: string;
  contract: string;
  warehouse: string;
  warehouse_name: string;
  available_quantity: number;
  received_quantity: number;
  allocated_to: string;
  carbon_emission: number;
  outgoing_contract_info: {
    contract_number: string;
    id: string;
  }[];
}

interface Document {
  id: string;
  name: string;
  document_type: string;
  received_quantity: number;
  url?: string;
}

interface ContractDetailsResponse {
  _id: string;
  contract_number: string;
  for_month: number;
  for_year: number;
  start_date: string;
  end_date: string;
  expected_quantity: number;
  buyer: string;
  seller: string;
  place_of_loading: string;
  place_of_delivery: string;
  origin: string;
  invoice_number: string;
  available_products: AvailableProduct[];
  warehouse_quantities: WarehouseAllocation[];
  documents: Document[];
  chosen_product_id: string;
  notes: string[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: ContractDetailsResponse;
}

export default function ContractDetails() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contract_id = searchParams.get('contract_id') || '';
    
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [warehouseAllocations, setWarehouseAllocations] = useState<WarehouseAllocation[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [notesExpanded, setNotesExpanded] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("details");
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
  
    // Fetch contract data
    useEffect(() => {
      const fetchContractDetails = async () => {
        setLoading(true);
        try {
          const response = await api.get<ApiResponse>(`/v2/contract/incoming/detail/${contract_id}`);
          const apiData = response.data;
          const mappedContract: Contract = {
            contract_number: apiData.contract_number,
            for_month: apiData.for_month,
            for_year: apiData.for_year,
            start_date: apiData.start_date,
            end_date: apiData.end_date,
            expected_quantity: apiData.expected_quantity,
            buyer: apiData.buyer,
            seller: apiData.seller,
            place_of_loading: apiData.place_of_loading,
            place_of_delivery: apiData.place_of_delivery,
            origin: apiData.origin,
            invoice_number: apiData.invoice_number,
            id: apiData._id,
            notes: apiData.notes,
            available_products: apiData.available_products,
            product_name: apiData.available_products.find(p => p.id === apiData.chosen_product_id)?.name.split('::')[0]?.trim() || '',
            certification_name: apiData.available_products.find(p => p.id === apiData.chosen_product_id)?.name.split('::')[1]?.trim() || '',
            warehouses: apiData.warehouse_quantities.map(w => w.warehouse_name).join(', '),
            received_quantity: apiData.warehouse_quantities.reduce((sum, w) => sum + w.received_quantity, 0),
            available_quantity: apiData.warehouse_quantities.reduce((sum, w) => sum + w.available_quantity, 0),
            difference: apiData.expected_quantity - apiData.warehouse_quantities.reduce((sum, w) => sum + w.received_quantity, 0),
            chosen_product_id: apiData.chosen_product_id
          };
  
          setContract(mappedContract);
          setWarehouseAllocations(apiData.warehouse_quantities);
          setDocuments(apiData.documents);
  
        } catch (error) {
          console.error("Failed to fetch contract details:", error);
          showToast({
            title: "Error",
            description: "Failed to fetch contract details. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      };
  
      if (contract_id) {
        fetchContractDetails();
      }
    }, [contract_id]);
  
    const handleBackClick = () => {
        router.push('/library/incomings');
    };
  
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNotes = e.target.value.split('\n');
      setContract(prev => prev ? {
        ...prev,
        notes: newNotes
      } : null);
    };
  
    const handleSaveNotes = () => {
      showToast({
        title: "Notes Saved",
        description: "Contract notes have been updated successfully.",
        variant: "default"
      });
    };
  
    const handleUpdateContract = async () => {
      if (!isEditing) {
        showToast({
          title: "Edit Mode Required",
          description: "Please enable edit mode first to make changes.",
          variant: "default"
        });
        return;
      }
  
      try {
        setUpdating(true);
        
        // Format dates in MM/DD/YYYY format as required by the API
        const formatDateForApi = (dateStr: string) => {
          if (!dateStr) return "";
          const date = new Date(dateStr);
          return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        };
        
        const updateData = {
          contract_id: contract?.id,
          product_id: contract?.chosen_product_id,
          start_date: formatDateForApi(contract?.start_date || ""),
          end_date: formatDateForApi(contract?.end_date || ""),
          expected_quantity: contract?.expected_quantity,
          buyer: contract?.buyer,
          seller: contract?.seller,
          place_of_loading: contract?.place_of_loading,
          place_of_delivery: contract?.place_of_delivery,
          origin: contract?.origin,
          invoice_number: contract?.invoice_number,
          notes: contract?.notes
        };
        
        console.log("updateData", updateData);        
        const response = await api.post('/v2/incoming/contract/update/', updateData);
        
        
        if ((response as any).status === 'success') {
          showToast({
            title: "Contract Updated",
            description: "Contract details have been updated successfully.",
            variant: "default"
          });
          
          // Turn off editing mode
          setIsEditing(false);
        } else {
          const errorMessage = (response as any).message || "Failed to update contract. Please try again.";
          showToast({
            title: "Update Failed",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Failed to update contract:", error);
        showToast({
          title: "Error",
          description: "An error occurred while updating the contract. Please try again.",
          variant: "destructive"
        });
      } finally {
        setUpdating(false);
      }
    };

    const handleDownloadExtractions = async () => {
      try {
        setDownloadLoading(true);
        const documentIds = documents.map(doc => doc.id);
        
        if (documentIds.length === 0) {
          showToast({
            title: "No Documents",
            description: "There are no documents to download extractions from",
            variant: "destructive"
          });
          setDownloadLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/v2/contracts/incoming/download-extractions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ document_ids: documentIds })
        });

        if (!response.ok) throw new Error('Failed to download extractions');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileNameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
        const fileName = fileNameMatch ? fileNameMatch[1] : `contract_extractions_${contract?.contract_number}.xlsx`;

        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Download error:', error);
        showToast({
          title: "Download Failed",
          description: "Failed to download contract extractions. Please try again.",
          variant: "destructive"
        });
      } finally {
        setDownloadLoading(false);
      }
    };
  
    // Custom toast function (since toast is not available)
    const showToast = ({ title, description, variant }: { title: string; description: string; variant: "default" | "destructive" }) => {
      console.log(`TOAST: [${variant}] ${title} - ${description}`);
      alert(`${title}: ${description}`);
    };
  
    // Calculate contract status
    const getContractStatus = () => {
      if (!contract) return { label: "Unknown", color: "bg-gray-100 text-gray-600" };
      
      if (contract.received_quantity === 0) {
        return { label: "Not Started", color: "bg-gray-100 text-gray-600" };
      } else if (contract.received_quantity < contract.expected_quantity) {
        return { label: "In Progress", color: "bg-blue-100 text-blue-700" };
      } else {
        return { label: "Completed", color: "bg-green-100 text-green-700" };
      }
    };
  
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      try {
        return new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (e) {
        return dateStr;
      }
    };
  
    const statusInfo = getContractStatus();
    const progressPercentage = contract ? Math.min(Math.round((contract.received_quantity / contract.expected_quantity) * 100), 100) : 0;
  
    if (loading) {
      return (
        <div className="container mx-auto px-4 py-6 max-w-7xl flex flex-col justify-center items-center h-[80vh]">
          <div className="w-16 h-16 border-t-4 border-teal-500 border-solid rounded-full animate-spin mb-4"></div>
          <div className="text-xl text-gray-600 font-medium">Loading contract details...</div>
        </div>
      );
    }
  
    if (!contract) {
      return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Contract Not Found</h2>
            </div>
            <p>The contract you're looking for could not be found. Please check the contract ID and try again.</p>
          </div>
          <Button 
            onClick={handleBackClick} 
            className="flex items-center"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
        </div>
      );
    }
  
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back button and breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button onClick={handleBackClick} className="hover:text-gray-700">Contracts</button>
            <span>/</span>
            <span className="font-medium text-gray-700">{contract.contract_number}</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                <FileCheck className="mr-2 h-8 w-8 text-teal-600" />
                {contract.contract_number}
              </h1>
              <Badge className={cn("ml-2", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-sm transition-all"
                onClick={handleDownloadExtractions}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Extractions
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-600 shadow-sm transition-all"
                onClick={() => setNotesExpanded(!notesExpanded)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Notes
                {notesExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
          
          {/* Notes section (expandable) */}
          {notesExpanded && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200 mb-6 animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-teal-600" />
                  Contract Notes
                </Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 bg-teal-500 hover:bg-teal-600 text-white" 
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </Button>
              </div>
              <textarea
                id="notes"
                value={Array.isArray(contract.notes) ? contract.notes.join('\n') : ''}
                onChange={handleNotesChange}
                className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                placeholder="Add notes about this contract..."
              ></textarea>
            </div>
          )}
        </div>
        
        {/* Main content with tabs */}
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex bg-gradient-to-r from-gray-50 to-teal-50 p-1 rounded-lg">
            <TabsTrigger value="details" className="gap-2 px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-md transition-all">
              <FileCheck className="h-4 w-4" /> 
              <span className="hidden sm:inline">Contract Details</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2 px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white rounded-md transition-all">
              <Warehouse className="h-4 w-4" /> 
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all">
              <FileText className="h-4 w-4" /> 
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>
  
          {/* Contract Details Tab */}
          <TabsContent value="details" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contract details column */}
              <div className="lg:col-span-2">
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-teal-600" />
                        Contract Details
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`bg-gradient-to-r ${isEditing 
                            ? "from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800" 
                            : "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"} 
                            text-white shadow-sm transition-all`}
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm transition-all"
                            onClick={handleUpdateContract}
                            disabled={updating}
                          >
                            {updating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="product" className="text-sm font-medium text-gray-700 flex items-center">
                            <Package className="h-4 w-4 mr-2 text-teal-600" />
                            Product Specification
                          </Label>
                          <Select 
                            value={contract.chosen_product_id}
                            onValueChange={(value) => setContract(prev => prev ? {
                              ...prev,
                              chosen_product_id: value
                            } : null)}
                          >
                            <SelectTrigger className="w-full relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {contract.available_products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-teal-600" />
                              Start Date
                            </Label>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                              <Input 
                                id="start_date" 
                                type="text" 
                                value={formatDate(contract.start_date)} 
                                onChange={(e) => setContract(prev => prev ? {
                                  ...prev,
                                  start_date: e.target.value
                                } : null)}
                                className="pl-10 border-teal-100 focus:border-teal-300"
                                readOnly={!isEditing}
                                style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                              />
                              {isEditing && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" className="absolute left-1 top-1/2 transform -translate-y-1/2 p-0 h-8 w-8">
                                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={new Date(contract.start_date)}
                                      onSelect={(date) => setContract(prev => prev ? {
                                        ...prev,
                                        start_date: date ? date.toISOString() : prev.start_date
                                      } : null)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              )}
                              {!isEditing && (
                                <CalendarIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-teal-600" />
                              End Date
                            </Label>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                              <Input 
                                id="end_date" 
                                type="text" 
                                value={formatDate(contract.end_date)} 
                                onChange={(e) => setContract(prev => prev ? {
                                  ...prev,
                                  end_date: e.target.value
                                } : null)}
                                className="pl-10 border-teal-100 focus:border-teal-300"
                                readOnly={!isEditing}
                                style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                              />
                              {isEditing && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" className="absolute left-1 top-1/2 transform -translate-y-1/2 p-0 h-8 w-8">
                                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={new Date(contract.end_date)}
                                      onSelect={(date) => setContract(prev => prev ? {
                                        ...prev,
                                        end_date: date ? date.toISOString() : prev.end_date
                                      } : null)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              )}
                              {!isEditing && (
                                <CalendarIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="contract_qty" className="text-sm font-medium text-gray-700 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-teal-600" />
                            Contract QTY (MT)
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                            <Input 
                              id="contract_qty" 
                              type="text" 
                              value={contract.expected_quantity.toString()} 
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                // Only allow numbers and decimal points
                                if (/^[0-9]*\.?[0-9]*$/.test(inputValue) || inputValue === '') {
                                  setContract(prev => prev ? {
                                    ...prev,
                                    expected_quantity: inputValue === '' ? 0 : parseFloat(inputValue) || 0
                                  } : null);
                                }
                              }}
                              className="pl-10 border-teal-100 focus:border-teal-300"
                              readOnly={!isEditing}
                              style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                            />
                            <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="place_of_loading" className="text-sm font-medium text-gray-700 flex items-center">
                            <Truck className="h-4 w-4 mr-2 text-teal-600" />
                            Place of Loading
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                            <Input 
                              id="place_of_loading" 
                              type="text" 
                              value={contract.place_of_loading === "nan" ? "" : contract.place_of_loading} 
                              onChange={(e) => setContract(prev => prev ? {
                                ...prev,
                                place_of_loading: e.target.value
                              } : null)}
                              className="pl-10 border-teal-100 focus:border-teal-300"
                              readOnly={!isEditing}
                              style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                            />
                            <Truck className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="place_of_delivery" className="text-sm font-medium text-gray-700 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-teal-600" />
                            Place of Delivery
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                            <Input 
                              id="place_of_delivery" 
                              type="text" 
                              value={contract.place_of_delivery} 
                              onChange={(e) => setContract(prev => prev ? {
                                ...prev,
                                place_of_delivery: e.target.value
                              } : null)}
                              className="pl-10 border-teal-100 focus:border-teal-300"
                              readOnly={!isEditing}
                              style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                            />
                            <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="seller" className="text-sm font-medium text-gray-700 flex items-center">
                            <Building className="h-4 w-4 mr-2 text-teal-600" />
                            Seller
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                            <Input 
                              id="seller" 
                              type="text" 
                              value={contract.seller} 
                              onChange={(e) => setContract(prev => prev ? {
                                ...prev,
                                seller: e.target.value
                              } : null)}
                              className="pl-10 border-teal-100 focus:border-teal-300"
                              readOnly={!isEditing}
                              style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                            />
                            <Building className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="buyer" className="text-sm font-medium text-gray-700 flex items-center">
                            <Building className="h-4 w-4 mr-2 text-teal-600" />
                            Buyer
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                            <Input 
                              id="buyer" 
                              type="text" 
                              value={contract.buyer} 
                              onChange={(e) => setContract(prev => prev ? {
                                ...prev,
                                buyer: e.target.value
                              } : null)}
                              className="pl-10 border-teal-100 focus:border-teal-300"
                              readOnly={!isEditing}
                              style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                            />
                            <Building className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="origin" className="text-sm font-medium text-gray-700 flex items-center">
                            <Flag className="h-4 w-4 mr-2 text-teal-600" />
                            Origin
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                            <Input 
                              id="origin" 
                              type="text" 
                              value={contract.origin} 
                              onChange={(e) => setContract(prev => prev ? {
                                ...prev,
                                origin: e.target.value
                              } : null)}
                              className="pl-10 border-teal-100 focus:border-teal-300"
                              readOnly={!isEditing}
                              style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                            />
                            <Flag className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="invoice_number" className="text-sm font-medium text-gray-700 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-teal-600" />
                            Invoice Number
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                            <Input 
                              id="invoice_number" 
                              type="text" 
                              value={contract.invoice_number} 
                              onChange={(e) => setContract(prev => prev ? {
                                ...prev,
                                invoice_number: e.target.value
                              } : null)}
                              className="pl-10 border-teal-100 focus:border-teal-300"
                              readOnly={!isEditing}
                              style={!isEditing ? { backgroundColor: '#f8fafc', cursor: 'default' } : {}}
                            />
                            <FileText className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label htmlFor="update_seller" className="text-sm font-medium text-gray-700 flex items-center">
                            <RefreshCcw className="h-4 w-4 mr-2 text-teal-600" />
                            Update Seller
                          </Label>
                          <Select>
                            <SelectTrigger className="w-full relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-blue-50 opacity-20 rounded-md group-hover:opacity-40 transition-opacity"></div>
                              <SelectValue placeholder="Select a seller" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="seller1">Select a seller</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Status column */}
              <div>
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 border-b pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-teal-600" />
                      Contract Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${progressPercentage >= 100 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'} transition-all duration-500 ease-in-out`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm group hover:shadow-md transition-all">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Package className="h-4 w-4 mr-1 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          Expected
                        </div>
                        <div className="text-xl font-bold text-gray-800">{contract.expected_quantity.toFixed(2)} MT</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 shadow-sm group hover:shadow-md transition-all">
                        <div className="text-sm text-blue-700 flex items-center">
                          <Truck className="h-4 w-4 mr-1 text-blue-400 group-hover:text-blue-600 transition-colors" />
                          Received
                        </div>
                        <div className="text-xl font-bold text-blue-800">{contract.received_quantity.toFixed(2)} MT</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200 shadow-sm group hover:shadow-md transition-all">
                        <div className="text-sm text-green-700 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-400 group-hover:text-green-600 transition-colors" />
                          Available
                        </div>
                        <div className="text-xl font-bold text-green-800">{contract.available_quantity.toFixed(2)} MT</div>
                      </div>
                      <div className={`bg-gradient-to-br ${contract.difference >= 0 ? 'from-orange-50 to-orange-100 border-orange-200' : 'from-green-50 to-green-100 border-green-200'} p-3 rounded-lg border shadow-sm group hover:shadow-md transition-all`}>
                        <div className={`text-sm flex items-center ${contract.difference >= 0 ? 'text-orange-700' : 'text-green-700'}`}>
                          <Search className={`h-4 w-4 mr-1 ${contract.difference >= 0 ? 'text-orange-400 group-hover:text-orange-600' : 'text-green-400 group-hover:text-green-600'} transition-colors`} />
                          Difference
                        </div>
                        <div className={`text-xl font-bold ${contract.difference >= 0 ? 'text-orange-800' : 'text-green-800'}`}>
                          {Math.abs(contract.difference).toFixed(2)} MT
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-teal-600" />
                      Product Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Package className="h-4 w-4 mr-1 text-teal-500" />
                          Product Type
                        </span>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                          {contract.product_name}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-1 text-blue-500" />
                          Certification
                        </span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                          {contract.certification_name}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-purple-500" />
                          Contract Month
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(contract.start_date).toLocaleString('default', { month: 'long' })}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 text-purple-500" />
                          Contract Year
                        </span>
                        <span className="text-sm font-medium">{contract.for_year}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
  
          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Network className="h-5 w-5 text-amber-600" />
                        Material Flow
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-64 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-inner p-4 relative overflow-hidden">
                      {/* Seller */}
                      <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-lg"></div>
                      <div className="absolute left-6 top-1/3 transform -translate-y-1/2">
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-200 shadow-sm flex items-center group hover:shadow-md transition-all">
                          <Building className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{contract.seller}</span>
                        </div>
                      </div>
                      
                      {/* Warehouses */}
                      {warehouseAllocations.length > 0 && (
                        <div className="absolute left-1/3 top-0 h-full w-4 bg-gradient-to-b from-amber-400 to-amber-600 rounded-sm"></div>
                      )}
                      {warehouseAllocations.length > 0 && (
                        <div className="absolute left-1/3 top-1/3 transform -translate-y-1/2 ml-6">
                          <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-md border border-amber-200 shadow-sm flex items-center group hover:shadow-md transition-all">
                            <Warehouse className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{warehouseAllocations[0]?.warehouse_name}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Available */}
                      <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-b from-green-400 to-green-600 rounded-r-lg"></div>
                      <div className="absolute right-6 top-1/3 transform -translate-y-1/2">
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md border border-green-200 shadow-sm flex items-center group hover:shadow-md transition-all">
                          <CheckCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Available</span>
                        </div>
                      </div>
                      
                      {/* Allocated */}
                      {warehouseAllocations.length > 0 && warehouseAllocations[0]?.outgoing_contract_info.length > 0 && (
                        <div className="absolute bottom-16 right-1/3 transform translate-x-1/2">
                          <div className="bg-red-50 text-red-700 px-3 py-1 rounded-md border border-red-200 shadow-sm flex items-center group hover:shadow-md transition-all">
                            <Tag className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            <div className="flex flex-wrap gap-1">
                              {warehouseAllocations[0]?.outgoing_contract_info.map((info, index) => (
                                <span
                                  key={info.id}
                                  className="text-sm text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/library/outgoing-contract?id=${info.id}`);
                                  }}
                                >
                                  {info.contract_number}
                                  {index < warehouseAllocations[0]?.outgoing_contract_info.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Flow lines */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        {/* Seller to Warehouse */}
                        <path 
                          d="M 4 80 L 33% 80" 
                          stroke="url(#blueGradient)" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="5,5"
                        >
                          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2s" repeatCount="indefinite" />
                        </path>
                        
                        {/* Warehouse to Available */}
                        <path 
                          d="M 33% 80 L 96% 80" 
                          stroke="url(#amberGradient)" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="5,5"
                        >
                          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2s" repeatCount="indefinite" />
                        </path>
                        
                        {/* Warehouse to Allocated */}
                        {warehouseAllocations.length > 0 && warehouseAllocations[0]?.outgoing_contract_info.length > 0 && (
                          <path 
                            d="M 33% 80 Q 63% 120 66% 150" 
                            stroke="url(#redGradient)" 
                            strokeWidth="2" 
                            fill="none"
                            strokeDasharray="5,5"
                          >
                            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2s" repeatCount="indefinite" />
                          </path>
                        )}
                        
                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                          <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fcd34d" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </div>
            
              <div className="lg:col-span-3">
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Warehouse className="h-5 w-5 text-amber-600" />
                        Warehouse Inventory
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-amber-50 to-amber-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                              <Warehouse className="h-4 w-4 mr-2 text-amber-500" />
                              Warehouse
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center justify-end">
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Available QTY (MT)
                              </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center justify-end">
                                <Truck className="h-4 w-4 mr-2 text-blue-500" />
                                Received QTY (MT)
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-purple-500" />
                                Allocated To
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {warehouseAllocations.length > 0 ? (
                            warehouseAllocations.map((allocation, index) => {
                              const rowId = `wh-${index}`;
                              const isHovered = hoveredRow === rowId;
                              
                              return (
                                <tr 
                                  key={index}
                                  className={cn(
                                    "transition-colors",
                                    isHovered ? 'bg-amber-50' : ''
                                  )}
                                  onMouseEnter={() => setHoveredRow(rowId)}
                                  onMouseLeave={() => setHoveredRow(null)}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {allocation.warehouse_name}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${(allocation.available_quantity > 0) ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                    {Math.abs(allocation.available_quantity) < 1e-6 ? '0.000' : allocation.available_quantity.toFixed(3)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium">
                                    {Math.abs(allocation.received_quantity) < 1e-6 ? '0.000' : allocation.received_quantity.toFixed(3)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {allocation.outgoing_contract_info.length > 0 ? (
                                      <div className="flex items-center space-x-1">
                                        <ExternalLink className="h-3 w-3 text-purple-500" />
                                        <div className="flex flex-wrap gap-1">
                                          {allocation.outgoing_contract_info.map((info, index) => (
                                            <span
                                              key={info.id}
                                              className="text-sm text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/library/outgoing-contract?id=${info.id}`);
                                              }}
                                            >
                                              {info.contract_number}
                                              {index < allocation.outgoing_contract_info.length - 1 ? ', ' : ''}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">—</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                <div className="flex flex-col items-center py-4">
                                  <Warehouse className="h-10 w-10 text-gray-300 mb-2" />
                                  <p>No warehouse allocations available for this contract.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-amber-50 to-amber-100 border-t border-gray-200">
                          <tr>
                            <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Totals</td>
                            <td className="px-6 py-3 text-right text-xs font-medium text-green-600">
                              {contract.available_quantity.toFixed(3)} MT
                            </td>
                            <td className="px-6 py-3 text-right text-xs font-medium text-blue-600">
                              {contract.received_quantity.toFixed(3)} MT
                            </td>
                            <td className="px-6 py-3 text-right"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
  
          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 animate-fade-in">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Documents
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {documents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              Document Name
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-2 text-purple-500" />
                              Document Type
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center justify-end">
                              <Package className="h-4 w-4 mr-2 text-amber-500" />
                              WB QTY (MT)
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc, index) => {
                          const rowId = `doc-${index}`;
                          const isHovered = hoveredRow === rowId;
                          
                          return (
                            <tr 
                              key={index}
                              className={cn(
                                "transition-colors",
                                isHovered ? 'bg-blue-50' : ''
                              )}
                              onMouseEnter={() => setHoveredRow(rowId)}
                              onMouseLeave={() => setHoveredRow(null)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                  <span 
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/library/document?document_id=${doc.id}`);
                                    }}
                                  >
                                    {doc.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                                  {doc.document_type}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-amber-700 font-medium">
                                {doc.received_quantity ? doc.received_quantity.toFixed(3) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-gray-500">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
                    <p className="text-sm text-gray-400 max-w-md text-center">
                      There are no documents associated with this contract yet. Documents will appear here once they are uploaded.
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Upload Document
                      </span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }