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

interface ContractDetails {
  id: string;
  contractNumber: string;
  month: string;
  year: string;
  buyer: string;
  seller: string;
  quantity: number;
  product: string;
  billOfLading: string;
  docLink: string;
  portOfLoading: string;
  portOfDischarge: string;
  isAllocated: boolean;
  isINS: boolean;
}

interface Allocation {
  contractId: string;
  contractNumber: string;
  warehouse: string;
  allocatedQuantity: number;
  ghg: number;
  groupId: string;
  outgoingSD: string;
  outgoingSDUrl: string;
}

interface Warehouse {
  id: string;
  name: string;
}

// Mock API functions
const fetchContractDetails = async (id: string): Promise<ContractDetails> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id,
    contractNumber: 'CTR-2024-001',
    month: 'March',
    year: '2024',
    buyer: 'EcoFuels Inc.',
    seller: 'Green Energy Corp',
    quantity: 50000,
    product: 'Renewable Diesel',
    billOfLading: 'BL-24-0123',
    docLink: '#',
    portOfLoading: 'LANGSAT',
    portOfDischarge: 'HUELVA',
    isAllocated: false,
    isINS: true,
  };
};

const fetchAllocations = async (id: string): Promise<Allocation[][]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    [
      {
        contractId: '1',
        contractNumber: 'INC-2024-001',
        warehouse: 'Warehouse A',
        allocatedQuantity: 25000,
        ghg: 80.430,
        groupId: 'group1',
        outgoingSD: 'Not generated',
        outgoingSDUrl: '',
      },
      {
        contractId: '2',
        contractNumber: 'INC-2024-002',
        warehouse: 'Warehouse A',
        allocatedQuantity: 25000,
        ghg: 80.430,
        groupId: 'group1',
        outgoingSD: 'Not generated',
        outgoingSDUrl: '',
      },
    ],
    [
      {
        contractId: '3',
        contractNumber: 'INC-2024-003',
        warehouse: 'Warehouse B',
        allocatedQuantity: 50000,
        ghg: 94.140,
        groupId: 'group2',
        outgoingSD: 'SD-2024-001',
        outgoingSDUrl: '#',
      },
    ],
  ];
};

const fetchWarehouses = async (): Promise<Warehouse[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', name: 'Warehouse A' },
    { id: '2', name: 'Warehouse B' },
    { id: '3', name: 'Warehouse C' },
  ];
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['2023', '2024', '2025'];

export default function ContractPage() {
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

  useEffect(() => {
    if (contractId) {
      loadContractData();
    }
  }, [contractId]);

  const loadContractData = async () => {
    try {
      setLoading(true);
      const [contractData, allocationsData, warehousesData] = await Promise.all([
        fetchContractDetails(contractId!),
        fetchAllocations(contractId!),
        fetchWarehouses(),
      ]);
      
      setContract(contractData);
      setAllocations(allocationsData);
      setWarehouses(warehousesData);
      
      // Initialize update form with current values
      setUpdateForm({
        month: contractData.month,
        year: contractData.year,
        quantity: contractData.quantity,
        portOfLoading: contractData.portOfLoading,
        portOfDischarge: contractData.portOfDischarge,
      });
    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContract = async () => {
    try {
      // API call to update contract
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowUpdateModal(false);
      loadContractData(); // Reload data
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleDeleteContract = async () => {
    try {
      // API call to delete contract
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/library/outgoing');
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const handlePreviewAllocation = async () => {
    try {
      // API call to preview allocation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPreviewAllocations(allocations); // Using mock data for preview
    } catch (error) {
      console.error('Error previewing allocation:', error);
    }
  };

  const handleApproveAllocation = async () => {
    try {
      // API call to approve allocation
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadContractData(); // Reload data
    } catch (error) {
      console.error('Error approving allocation:', error);
    }
  };

  const handleUndoAllocation = async () => {
    try {
      // API call to undo allocation
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadContractData(); // Reload data
    } catch (error) {
      console.error('Error undoing allocation:', error);
    }
  };

  const handleGenerateTemplate = async (groupId: string, sdNumber: string, certNumber: string) => {
    try {
      // API call to generate template
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Handle file download
    } catch (error) {
      console.error('Error generating template:', error);
    }
  };

  if (loading || !contract) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading contract details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
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
            >
              Delete Contract
            </Button>
            <Button onClick={() => setShowUpdateModal(true)}>
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
            >
              Suez
            </Button>
            <Button
              variant={route === 'COGH' ? 'default' : 'outline'}
              onClick={() => setRoute('COGH')}
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
                        <td className="px-4 py-3">{allocation.allocatedQuantity.toLocaleString()}</td>
                        <td className="px-4 py-3">{allocation.ghg}</td>
                        <td className="px-4 py-3">
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
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>

            <Button
              variant="destructive"
              onClick={handleUndoAllocation}
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
                onClick={() => window.location.href = '/reporting/download-demo-csv/'}
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
                  />
                  <Button disabled={!uploadFile}>
                    Upload Allocations
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Select Warehouses To Allocate From:</Label>
                <Select
                  value={selectedWarehouses.join(',')}
                  onValueChange={(value) => setSelectedWarehouses(value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouses" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handlePreviewAllocation}
                  disabled={selectedWarehouses.length === 0}
                >
                  Preview Allocation
                </Button>
              </div>
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
                            <td className="px-4 py-3">{contract.month}</td>
                            <td className="px-4 py-3">{allocation.allocatedQuantity.toLocaleString()}</td>
                            <td className="px-4 py-3">{allocation.warehouse}</td>
                            <td className="px-4 py-3">{allocation.ghg}</td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>
                <Button onClick={handleApproveAllocation}>
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
              />
            </div>

            <div className="space-y-2">
              <Label>Port of Loading</Label>
              <Input
                value={updateForm.portOfLoading}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, portOfLoading: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Port of Discharge</Label>
              <Input
                value={updateForm.portOfDischarge}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, portOfDischarge: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContract}>
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
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContract}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}