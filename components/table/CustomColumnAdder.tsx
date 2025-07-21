"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BASE_URL, defaultHeaders } from "@/lib/api";

export interface Column {
  key: string;
  label: string;
}

export interface DataFrameType {
  [key: string]: (number | string)[];
}

interface CustomColumnAdderProps {
  dataFrame: DataFrameType;
  onColumnAdded: (newData: DataFrameType, newColumn: Column) => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonText?: string;
  apiEndpoint?: string;
  className?: string;
}

export default function CustomColumnAdder({
  dataFrame,
  onColumnAdded,
  buttonVariant = "default",
  buttonText = "Add Column",
  apiEndpoint = `${BASE_URL}/reporting/v2/formula-calculator/`,
  className,
}: CustomColumnAdderProps) {
  const [newColumn, setNewColumn] = useState({ name: "", formula: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddColumn = async () => {
    try {
      setIsLoading(true);
      
      // Make sure we have valid inputs
      if (!newColumn.name || !newColumn.formula) {
        toast.error('Please provide both column name and formula');
        return;
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataframe: dataFrame,
          formula: newColumn.formula,
          new_column: newColumn.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate formula: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // Call the callback with new data
        onColumnAdded(result.data, { key: newColumn.name, label: newColumn.name });
        setNewColumn({ name: "", formula: "" });
        setIsDialogOpen(false);
        toast.success('Formula applied successfully');
      } else {
        throw new Error(result.message || 'Failed to apply formula');
      }
    } catch (error) {
      console.error('Error in handleAddColumn:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className={className}>
          <Plus className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Column Name</label>
            <Input
              value={newColumn.name}
              onChange={(e) =>
                setNewColumn({ ...newColumn, name: e.target.value })
              }
              placeholder="e.g., Search1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Excel Formula</label>
            <Input
              value={newColumn.formula}
              onChange={(e) =>
                setNewColumn({ ...newColumn, formula: e.target.value })
              }
              placeholder="e.g., =VLOOKUP(A, A:D, 2, FALSE)"
            />
            <p className="text-sm text-gray-500">
              Enter an Excel formula using column references (e.g., A, B, C, D)
            </p>
          </div>
          <Button 
            onClick={handleAddColumn} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Add Column"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 