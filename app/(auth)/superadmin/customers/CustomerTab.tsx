'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddCustomerModal from './AddCustomerModal';
import AddAdminUserModal from './AddAdminUserModal';

interface Customer {
  id: string;
  name: string;
  description?: string;
  address?: string;
  status: string;
}

interface CustomerTabProps {
  customers: Customer[];
  loading: boolean;
  statusFilter: string;
  onCustomerCreated: () => void;
  onStatusFilterChange: (status: string) => void;
}

export default function CustomerTab({ customers, loading, statusFilter, onCustomerCreated, onStatusFilterChange }: CustomerTabProps) {
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);

  const handleCustomerCreated = (customer: Customer) => {
    setCreatedCustomer(customer);
    // onCustomerCreated(); // Trigger refresh of customers list
  };

  const closeAddCustomerModal = () => setShowAddCustomerModal(false);
  const closeAddAdminUserModal = () => {
    setCreatedCustomer(null);
    onCustomerCreated(); // Trigger refresh of customers list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage customer accounts</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-sm font-medium">
                  Status:
                </label>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowAddCustomerModal(true)}>Add Customer</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No customers to display. Add a customer to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">Description</th>
                    <th className="py-3 px-4 text-left font-medium">Address</th>
                    <th className="py-3 px-4 text-left font-medium">RNG Customer</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t">
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">{customer.description || '-'}</td>
                      <td className="py-3 px-4">{customer.address || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddCustomerModal && (
        <AddCustomerModal
          onClose={closeAddCustomerModal}
          onCustomerCreated={handleCustomerCreated}
        />
      )}
      
      {createdCustomer && (
        <AddAdminUserModal
          customer={createdCustomer}
          onClose={closeAddAdminUserModal}
        />
      )}
    </>
  );
} 