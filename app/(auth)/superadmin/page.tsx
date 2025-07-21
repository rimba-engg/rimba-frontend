'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerTab from './customers/CustomerTab';
import UserTab from './UserTab';
import SettingsTab from './SettingsTab';
import { api } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  description?: string;
  address?: string;
  status: string;
  created_at: string;
}

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  const fetchCustomers = async (status?: string) => {
    try {
      setLoading(true);
      const url = status ? `/user-mgt/v2/customer/?status=${status}` : '/user-mgt/v2/customer/';
      const response: any = await api.get(url);
      if (response.success) {
        setCustomers(response.data);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (err) {
      setError('An error occurred while fetching customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(statusFilter);
  }, [statusFilter]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Tabs defaultValue="customers" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <CustomerTab 
              customers={customers}
              loading={loading}
              statusFilter={statusFilter}
              onCustomerCreated={() => fetchCustomers(statusFilter)}
              onStatusFilterChange={handleStatusFilterChange}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
