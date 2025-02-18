'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Download, Filter } from 'lucide-react';

export default function StorageInventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Storage Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your storage inventory levels.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Database className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
            Storage inventory reporting coming soon
          </div>
        </div>
      </div>
    </div>
  );
}