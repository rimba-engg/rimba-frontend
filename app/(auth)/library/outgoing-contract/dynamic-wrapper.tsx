'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, X, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { ContractDetails, Allocation, Warehouse } from './types';
import { Loader } from '@/components/ui/loader';
import WarehouseDropdown from '@/app/(auth)/library/outgoing-contract/WarehouseDropdown';
import {BASE_URL} from '@/lib/api';

// Replace the mock API functions with real API calls
const fetchContractData = async (id: string): Promise<{
  contract: ContractDetails;
  allocations: Allocation[][];
  warehouses: Warehouse[];
}> => {
  const response = await api.get<{
    status: string;
    message: string;
    data: {
      contract_id: string;
      contract_number: string;
      for_month: string;
      for_year: string;
      buyer: string;
      seller: string;
      quantity: number;
      product: string;
      bill_of_lading: string;
      doc_link: string;
      port_of_loading: string;
      port_of_discharge: string;
      is_allocated: string;
      is_ins: string;
      warehouses: Warehouse[];
      allocations?: {
        contract_id: string;
        contract_number: string;
        warehouse: string;
        allocated_quantity: number;
        ghg: number;
        outgoing_sd: string;
        outgoing_sd_url: string;
        group_id: string;
        for_month: string;
      }[][];
    };
  }>(`/v2/contract/outgoing/detail/${id}/`);

  if (response.status !== 'success') {
    throw new Error(response.message || 'Failed to fetch contract data');
  }

  const { data } = response;
  
  return {
    contract: {
      id: data.contract_id,
      contractNumber: data.contract_number,
      month: data.for_month,
      year: data.for_year,
      buyer: data.buyer,
      seller: data.seller,
      quantity: data.quantity,
      product: data.product,
      billOfLading: data.bill_of_lading,
      docLink: data.doc_link,
      portOfLoading: data.port_of_loading,
      portOfDischarge: data.port_of_discharge,
      isAllocated: data.is_allocated === 'true',
      isINS: data.is_ins === 'true',
    },
    allocations: data.allocations?.map(group => 
      group.map(allocation => ({
        contractId: allocation.contract_id,
        contractNumber: allocation.contract_number,
        warehouse: allocation.warehouse,
        allocatedQuantity: allocation.allocated_quantity,
        ghg: allocation.ghg,
        outgoingSD: allocation.outgoing_sd,
        outgoingSDUrl: allocation.outgoing_sd_url,
        groupId: allocation.group_id,
        month: allocation.for_month,
      }))
    ) || [],
    warehouses: data.warehouses,
  };
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['2023', '2024', '2025'];

export default function ContractClient() {  
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [allocations, setAllocations] = useState<Allocation[][]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [route, setRoute] = useState<'Suez' | 'COGH'>('Suez');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewAllocations, setPreviewAllocations] = useState<Allocation[][]>([]);
  const [updateForm, setUpdateForm] = useState({
    month: '',
    year: '',
    quantity: 0,
    portOfLoading: '',
    portOfDischarge: '',
  });
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  // New state to indicate an API call is in progress
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (contractId) {
      loadContractData();
    }
  }, [contractId]);

  const loadContractData = async () => {
    try {
      setLoading(true);
      const data = await fetchContractData(contractId!);
      
      setContract(data.contract);
      setAllocations(data.allocations);
      setWarehouses(data.warehouses);
      
      // Initialize update form with current values
      setUpdateForm({
        month: data.contract.month,
        year: data.contract.year,
        quantity: data.contract.quantity,
        portOfLoading: data.contract.portOfLoading,
        portOfDischarge: data.contract.portOfDischarge,
      });
    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContract = async () => {
    setProcessing(true);
    try {
      // API call to update contract
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowUpdateModal(false);
      await loadContractData(); // Reload data
    } catch (error) {
      console.error('Error updating contract:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteContract = async () => {
    setProcessing(true);
    try {
      // API call to delete contract
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/library/outgoing');
    } catch (error) {
      console.error('Error deleting contract:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveAllocationFromCSV = async () => {
    if (!uploadFile || !contract) return;
    try {
      console.log('approving allocations for contract', contract?.id);

      const token = localStorage.getItem('access_token');
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${token}`);
      // Create the form data and append the file.
      const formData = new FormData();
      formData.append("contract_id", contract.id);
      formData.append("csv_file", uploadFile);
      // Set up the request options.
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow" as RequestRedirect,
      };
      // Make the API call.
      const response = await fetch(`${BASE_URL}/v2/contract/outgoing/allocate-from-csv/`, requestOptions);
      const result = await response.json();
      console.log("Upload result:", result);
      loadContractData();

    } catch (error) {
      console.error('Error approving allocation from CSV:', error);
    }
  };

  const handlePreviewAllocation = async () => {
    setProcessing(true);
    try {
      const response = await api.post<{
        status: string;
        message: string;
        data: any[][]; // raw allocations response
      }>('/v2/contract/outgoing/preview-allocation/', {
        outgoing_contract: contract?.id,
        warehouses: selectedWarehouses,
      });

      if (response.status === 'success') {
        console.log(response.data);
        // Map raw allocation keys to the desired format
        const formattedAllocations = response.data.map((group) =>
          group.map((allocation) => ({
            contractId: allocation.contract_id,
            contractNumber: allocation.contract_number,
            warehouse: allocation.warehouse_name,
            allocatedQuantity: allocation.allocated_amount,
            ghg: allocation.ghg,
            outgoingSD: allocation.outgoing_sd,
            outgoingSDUrl: allocation.outgoing_sd_url,
            groupId: allocation.group_id,
            month: allocation.for_month,
          }))
        );
        setPreviewAllocations(formattedAllocations);
      } else {
        console.error('Error previewing allocation:', response.message);
      }
    } catch (error) {
      console.error('Error previewing allocation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveAllocation = async () => {
    setProcessing(true);
    try {
      console.log('approving allocations for contract', uploadFile);
      if (uploadFile) {
        await handleApproveAllocationFromCSV();
      } else {
        const response = await api.post<{
          status: string;
          message: string;
          data: any[][]; // raw allocations response
        }>('/v2/contract/outgoing/allocate/', {
          outgoing_contract: contract?.id,
          warehouses: selectedWarehouses,
        });

        if (response.status === 'success') {
          console.log(response.data);
          loadContractData();
        } else {
          console.error('Error previewing allocation:', response.message);
        }
      }
    } catch (error) {
      console.error('Error previewing allocation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleUndoAllocation = async () => {
    setProcessing(true);
    try {
      console.log('undoing allocation for contract', contract?.id);
      const response = await api.post<{
        status: string;
        message: string;
        data: any[][]; // raw allocations response
      }>('/v2/contract/outgoing/undo-allocation/', {
        contract_id: contract?.id
      });

      if (response.status === 'success') {
        console.log(response.data);
        loadContractData();
      } else {
        console.error('Error undoing allocation:', response.message);
      }
    } catch (error) {
      console.error('Error undoing allocation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateTemplate = async (groupId: string, sdNumber: string, certNumber: string) => {
    setProcessing(true);
    try {
      // API call to generate template
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Handle file download
    } catch (error) {
      console.error('Error generating template:', error);
    } finally {
      setProcessing(false);
    }
  };

  const toggleWarehouseSelection = (warehouseId: string) => {
    setSelectedWarehouses(prev => {
      if (prev.includes(warehouseId)) {
        return prev.filter(id => id !== warehouseId);
      }
      return [...prev, warehouseId];
    });
  };

  const handleUploadAllocations = async () => {
    if (!uploadFile || !contract) return;
    setProcessing(true);
    try {
      console.log('uploading allocations for contract', contract.id);

      const token = localStorage.getItem('access_token');
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${token}`);
      // Create the form data and append the file.
      const formData = new FormData();
      formData.append("contract_id", contract.id);
      formData.append("csv_file", uploadFile);
      // Set up the request options.
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow" as RequestRedirect,
      };

      // Make the API call.
      const response = await fetch(`${BASE_URL}/v2/contract/outgoing/preview-allocation-from-csv/`, requestOptions);
      const result = await response.json();
      console.log("Upload result:", result);

      if (response.status == 200) {
        // Map raw allocation keys to the desired format
        const formattedAllocations = result.data.map((group: any) =>
          group.map((allocation: any) => ({
            contractId: allocation.contract_id,
            contractNumber: allocation.contract_number,
            warehouse: allocation.warehouse_name,
            allocatedQuantity: allocation.allocated_amount,
            ghg: allocation.ghg,
            outgoingSD: allocation.outgoing_sd,
            outgoingSDUrl: allocation.outgoing_sd_url,
            groupId: allocation.group_id,
            month: allocation.for_month,
          }))
        );
        setPreviewAllocations(formattedAllocations);
      } else {
        console.error('Error previewing allocations from CSV:', result.message);
      }
    } catch (error) {
      console.error('Error previewing allocations from CSV:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !contract) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader text="Loading contract details..." size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
              disabled={processing}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">{contract.contractNumber}</h1>
          </div>
          
          {!contract.isAllocated && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={processing}
              >
                Delete Contract
              </Button>
              <Button
                onClick={() => setShowUpdateModal(true)}
                disabled={processing}
              >
                Update Contract
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <th className="py-4 text-left">Month</th>
                <td className="py-4">{`${contract.month} ${contract.year}`}</td>
              </tr>
              <tr className="border-b">
                <th className="py-4 text-left">Buyer</th>
                <td className="py-4">{contract.buyer}</td>
              </tr>
              <tr className="border-b">
                <th className="py-4 text-left">Quantity</th>
                <td className="py-4">{contract.quantity.toLocaleString()} MT</td>
              </tr>
              <tr className="border-b">
                <th className="py-4 text-left">Product</th>
                <td className="py-4">{contract.product}</td>
              </tr>
              <tr className="border-b">
                <th className="py-4 text-left">Bill Of Lading</th>
                <td className="py-4">
                  {contract.billOfLading && (
                    <a
                      href={contract.docLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {contract.billOfLading}
                    </a>
                  )}
                </td>
              </tr>
              <tr className="border-b">
                <th className="py-4 text-left">Port Of Loading</th>
                <td className="py-4">{contract.portOfLoading}</td>
              </tr>
              <tr>
                <th className="py-4 text-left">Port Of Discharge</th>
                <td className="py-4">{contract.portOfDischarge}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Select Route:</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={route === 'Suez' ? 'default' : 'outline'}
                onClick={() => setRoute('Suez')}
                disabled={processing}
              >
                Suez
              </Button>
              <Button
                variant={route === 'COGH' ? 'default' : 'outline'}
                onClick={() => setRoute('COGH')}
                disabled={processing}
              >
                COGH
              </Button>
            </div>
          </div>

          {contract.isAllocated ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Incoming Allocated</h2>
              
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left">Contract Number</th>
                      <th className="px-4 py-3 text-left">Warehouse</th>
                      <th className="px-4 py-3 text-left">Allocated Quantity (MT)</th>
                      <th className="px-4 py-3 text-left">GHG (kgCO₂eq/dry-ton)</th>
                      <th className="px-4 py-3 text-left">Outgoing SD</th>
                    </tr>
                  </thead>
                  {allocations.map((group, groupIndex) => (
                    <tbody
                      key={groupIndex}
                      className="border-t-4 border-primary"
                    >
                      {group.map((allocation, index) => (
                        <tr key={allocation.contractId} className="border-b last:border-b-0">
                          <td className="px-4 py-3">
                            <a
                              href={`/reporting/incoming/${allocation.contractId}`}
                              className="text-primary hover:underline"
                            >
                              {allocation.contractNumber}
                            </a>
                          </td>
                          <td className="px-4 py-3">{allocation.warehouse}</td>
                          <td className="px-4 py-3">{allocation.allocatedQuantity}</td>
                          <td className="px-4 py-3">{allocation.ghg}</td>
                          {index === 0 && (
                            <td className="px-4 py-3" rowSpan={group.length}>
                              {allocation.outgoingSD === 'Not generated' ? (
                                <div className="space-y-2">
                                  <Input
                                    placeholder="SD Number"
                                    className="w-40"
                                  />
                                  <Input
                                    placeholder="Certification Number"
                                    className="w-40"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerateTemplate(
                                      allocation.groupId,
                                      'SD-123', // Replace with actual input values
                                      'CERT-123'
                                    )}
                                    disabled={processing}
                                  >
                                    Generate Template
                                  </Button>
                                </div>
                              ) : (
                                <a
                                  href={allocation.outgoingSDUrl}
                                  className="text-primary hover:underline"
                                >
                                  {allocation.outgoingSD}
                                </a>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>

              <Button
                variant="destructive"
                onClick={handleUndoAllocation}
                disabled={processing}
              >
                Undo Allocation
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
                This outgoing contract is not yet allocated.
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `${BASE_URL}/reporting/download-demo-csv/`}
                  disabled={processing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Demo CSV
                </Button>

                <div className="space-y-2">
                  <Label>Upload Allocations CSV</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="flex-1"
                      disabled={processing}
                    />
                    <Button onClick={handleUploadAllocations} disabled={!uploadFile || processing}>
                      Upload Allocations
                    </Button>
                  </div>
                </div>
                <WarehouseDropdown 
                  warehouses={warehouses} 
                  selectedWarehouses={selectedWarehouses}
                  onSelect={toggleWarehouseSelection}
                />
                <Button
                  onClick={handlePreviewAllocation}
                  disabled={selectedWarehouses.length === 0 || processing}
                >
                  Preview Allocations
                </Button>
              </div>

              {previewAllocations.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Allocated Contracts</h2>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left">Contract Number</th>
                          <th className="px-4 py-3 text-left">Month</th>
                          <th className="px-4 py-3 text-left">Allocated Amount (MT)</th>
                          <th className="px-4 py-3 text-left">Warehouse</th>
                          <th className="px-4 py-3 text-left">GHG (kgCO₂eq/dry-ton)</th>
                        </tr>
                      </thead>
                      {previewAllocations.map((group, groupIndex) => (
                        <tbody
                          key={groupIndex}
                          className="border-t-4 border-primary"
                        >
                          {group.map((allocation) => (
                            <tr key={allocation.contractId} className="border-b last:border-b-0">
                              <td className="px-4 py-3">
                                <a
                                  href={`/reporting/incoming/${allocation.contractId}`}
                                  className="text-primary hover:underline"
                                >
                                  {allocation.contractNumber}
                                </a>
                              </td>
                              <td className="px-4 py-3">{allocation.month}</td>
                              <td className="px-4 py-3">{allocation.allocatedQuantity}</td>
                              <td className="px-4 py-3">{allocation.warehouse}</td>
                              <td className="px-4 py-3">{allocation.ghg}</td>
                            </tr>
                          ))}
                        </tbody>
                      ))}
                    </table>
                  </div>
                  <Button onClick={handleApproveAllocation} disabled={processing}>
                    Approve Allocation
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Update Contract Modal */}
        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={updateForm.month}
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, month: value }))}
                  disabled={processing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={updateForm.year}
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, year: value }))}
                  disabled={processing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                  disabled={processing}
                />
              </div>

              <div className="space-y-2">
                <Label>Port of Loading</Label>
                <Input
                  value={updateForm.portOfLoading}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, portOfLoading: e.target.value }))}
                  disabled={processing}
                />
              </div>

              <div className="space-y-2">
                <Label>Port of Discharge</Label>
                <Input
                  value={updateForm.portOfDischarge}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, portOfDischarge: e.target.value }))}
                  disabled={processing}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateModal(false)} disabled={processing}>
                Cancel
              </Button>
              <Button onClick={handleUpdateContract} disabled={processing}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this contract? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={processing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteContract} disabled={processing}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global processing overlay with the Loader */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Loader text="Processing..." size="lg" />
        </div>
      )}
    </>
  );
}