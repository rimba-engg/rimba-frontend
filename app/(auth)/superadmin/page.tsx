'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerTab from './customers/CustomerTab';
import UserTab from './UserTab';
import SettingsTab from './SettingsTab';

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage customers, users, and system settings</p>
        </div>

        <Tabs defaultValue="customers" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <CustomerTab />
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
