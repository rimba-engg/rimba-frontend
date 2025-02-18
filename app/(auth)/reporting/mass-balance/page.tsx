'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scale, Download, Filter } from 'lucide-react';

export default function MassBalancePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mass Balance</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage material flows across your operations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Scale className="w-4 h-4 mr-2" />
            New Balance
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
            Mass balance reporting coming soon
          </div>
        </div>
      </div>
    </div>
  );
}