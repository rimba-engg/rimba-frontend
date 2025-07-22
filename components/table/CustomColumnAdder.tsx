"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  formula?: string;
  headerName?: string;
  field?: string;
  userProvided?: {
    formula?: string;
  };
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

// Add interface for suggestions
interface SuggestionItem {
  field: string;
  headerName: string;
}

// Custom suggestions dropdown component
const SuggestionsDropdown = ({ 
  suggestions, 
  onSelect, 
  selectedIndex,
  inputRect,
}: { 
  suggestions: SuggestionItem[],
  onSelect: (suggestion: SuggestionItem) => void,
  selectedIndex: number,
  inputRect: DOMRect | null,
}) => {
  if (!suggestions.length || !inputRect) return null;

  return (
    <div 
      className="absolute bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-y-auto w-full"
      style={{
        top: '100%',
        left: 0,
        zIndex: 50
      }}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.field}
          className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
            index === selectedIndex ? 'bg-blue-100' : ''
          }`}
          onClick={() => onSelect(suggestion)}
        >
          <div className="font-medium">{suggestion.headerName}</div>
          <div className="text-xs text-gray-500">{suggestion.field}</div>
        </div>
      ))}
    </div>
  );
};

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
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [inputRect, setInputRect] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const updateSuggestions = (value: string) => {
    const lastAtIndex = value.lastIndexOf('@');
    console.log('updateSuggestions called with value:', value);
    console.log('lastAtIndex:', lastAtIndex);
    
    if (lastAtIndex === -1) {
      setSuggestions([]);
      return;
    }

    const searchTerm = value.slice(lastAtIndex + 1).toLowerCase();
    console.log('searchTerm:', searchTerm);
    
    // Get column names from dataFrame
    const columns = Object.keys(dataFrame).map(key => ({
      field: key,
      headerName: key
    }));
    console.log('available columns:', columns);
    
    const filteredSuggestions = columns.filter(col => 
      col.headerName.toLowerCase().includes(searchTerm) || 
      col.field.toLowerCase().includes(searchTerm)
    );

    console.log('filtered suggestions:', filteredSuggestions);
    setSuggestions(filteredSuggestions);
    setSelectedSuggestionIndex(0);
    
    // Update input position for dropdown
    if (inputRef.current) {
      setInputRect(inputRef.current.getBoundingClientRect());
      console.log('input rect updated:', inputRef.current.getBoundingClientRect());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    console.log('handleInputChange:', newValue);
    setNewColumn({ ...newColumn, formula: newValue });
    updateSuggestions(newValue);
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    console.log('handleSuggestionSelect:', suggestion);
    const lastAtIndex = newColumn.formula.lastIndexOf('@');
    // Remove the @ symbol and just use the column name
    const newFormula = newColumn.formula.slice(0, lastAtIndex) + suggestion.field;
    console.log('new formula after suggestion:', newFormula);
    setNewColumn({ ...newColumn, formula: newFormula });
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('handleKeyDown:', e.key);
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev > 0 ? prev - 1 : prev
        );
      } else if (e.key === 'Enter' && suggestions.length > 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    }
  };

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
        // Remove any existing =() wrapper from the formula
        const cleanFormula = newColumn.formula.replace(/^=?\((.*)\)$/, '$1');
        
        // Call the callback with new data and include the formula
        onColumnAdded(
          result.data, 
          { 
            key: newColumn.name, 
            label: newColumn.name,
            formula: cleanFormula,
            headerName: newColumn.name,
            field: newColumn.name,
            userProvided: {
              formula: cleanFormula
            }
          }
        );
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
      <DialogContent className="overflow-visible">
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
              placeholder="e.g., Total"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Formula</label>
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={newColumn.formula}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Use @ to reference columns (e.g., Column1 + Column2)"
                className="w-full min-h-[100px] resize-y"
              />
              <SuggestionsDropdown 
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                selectedIndex={selectedSuggestionIndex}
                inputRect={inputRect}
              />
            </div>
            <p className="text-sm text-gray-500">
              Type @ to reference column names, or use standard arithmetic operators (+, -, *, /)
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