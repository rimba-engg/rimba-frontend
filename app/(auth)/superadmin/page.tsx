'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  is_rng_customer: boolean;
  created_at: string;
}

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/user-mgt/v2/customer/');
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
    fetchCustomers();
  }, []);

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
              onCustomerCreated={() => fetchCustomers()}
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
