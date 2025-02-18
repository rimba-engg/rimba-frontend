'use client';

import { useState } from 'react';
import { FileText, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ExtractionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Extractions</h1>
          <p className="text-muted-foreground mt-2">
            View and manage extracted document data and results.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Extraction
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search extractions..."
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline" className="ml-4">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
            No extractions to display
          </div>
        </div>
      </div>
    </div>
  );
}