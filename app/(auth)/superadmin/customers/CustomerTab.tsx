'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddCustomerModal from './AddCustomerModal';
import AddAdminUserModal from './AddAdminUserModal';

export default function CustomerTab() {
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<any>(null);

  const openAddCustomerModal = () => setShowAddCustomerModal(true);
  const closeAddCustomerModal = () => setShowAddCustomerModal(false);

  const handleCustomerCreated = (customer: any) => {
    setCreatedCustomer(customer);
  };

  const closeAddAdminUserModal = () => {
    setCreatedCustomer(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage customer accounts</CardDescription>
            </div>
            <Button onClick={openAddCustomerModal}>Add Customer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No customers to display. Add a customer to get started.</p>
          </div>
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