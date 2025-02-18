'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LineChart, Download, Filter } from 'lucide-react';

export default function VertexPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vertex</h1>
          <p className="text-muted-foreground mt-2">
            View and analyze your Vertex reporting metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <LineChart className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
            Vertex reporting coming soon
          </div>
        </div>
      </div>
    </div>
  );
}