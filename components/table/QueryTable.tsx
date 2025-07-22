// pages/table.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ColDef, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy"});

/// Updated interfaces for API response and related types

interface NewColumn {
  headerName: string;
  field: string;
  formula: string;
}

interface SortingConfig {
  field: string;
  order: 'asc' | 'desc';
}

interface AgGridColumnFilter {
  filterType: string; // e.g. "text", "number", "date", etc.
  type: string;       // e.g. "contains", "equals", etc.
  filter: string | number | null;
}

interface ViewConfig {
  sorting?: SortingConfig[];
  agGridFilterModel?: Record<string, AgGridColumnFilter>;
}

export interface APIResponse {
  newColumns?: NewColumn[];
  viewConfig?: ViewConfig;
}

interface ColumnDefinition {
  headerName: string;
  field: string;
}

// Add this interface for column type information
export interface ColumnWithType extends ColumnDefinition {
  type: 'string' | 'number' | 'boolean' | 'date';
  sample?: any; // Optional sample value
  formula?: string; // Add formula property
}

// New interface for QueryTable props to pass in table data
interface QueryTableProps extends AgGridReactProps {
  initialRowData: any[];
  initialColumnDefs: ColumnWithType[];
  onColumnFormulaUpdate?: (field: string, formula: string) => void;
  onColumnDelete?: (field: string) => void;  // Add callback for column deletion
}

const removeTypeFromColumnDefs = (columnDefs: ColDef<any, any>[]): ColDef<any, any>[] => {
  return columnDefs.map(({ type, ...rest }) => rest);
};

// Add new interface for suggestion item
interface SuggestionItem {
  field: string;
  headerName: string;
}

// Add Dialog component for formula editing
const FormulaDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialFormula, 
  columnName,
  availableColumns 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formula: string) => void;
  initialFormula: string;
  columnName: string;
  availableColumns: ColumnWithType[];
}) => {
  const [formula, setFormula] = useState(initialFormula);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const updateSuggestions = (value: string) => {
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex === -1) {
      setSuggestions([]);
      return;
    }

    const searchTerm = value.slice(lastAtIndex + 1).toLowerCase();
    const filteredSuggestions = availableColumns
      .filter(col => col.headerName !== columnName)
      .filter(col => 
        col.headerName.toLowerCase().includes(searchTerm) || 
        col.field.toLowerCase().includes(searchTerm)
      )
      .map(col => ({
        field: col.field,
        headerName: col.headerName
      }));

    setSuggestions(filteredSuggestions);
    setSelectedSuggestionIndex(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setFormula(newValue);
    updateSuggestions(newValue);
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    const lastAtIndex = formula.lastIndexOf('@');
    const newFormula = formula.slice(0, lastAtIndex) + suggestion.field;
    setFormula(newFormula);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      onConfirm(formula);
      return;
    }

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
      } else if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw]">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Edit Formula for {columnName}</h3>
        </div>
        <div className="p-4">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={formula}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full h-32 p-3 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              placeholder="Enter formula... (use @ to reference columns)"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.field}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                      index === selectedSuggestionIndex ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="font-medium">{suggestion.headerName}</div>
                    <div className="text-xs text-gray-500">{suggestion.field}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press @ to reference columns • Ctrl+Enter to save • Escape to cancel
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(formula)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Formula
          </button>
        </div>
      </div>
    </div>
  );
};

// Simplified header component
const FormulaHeaderComponent = (props: any & {
  onColumnFormulaUpdate?: (field: string, formula: string) => void;
  onColumnDelete?: (field: string) => void;
  columnDefs: ColumnWithType[];
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formula, setFormula] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const formulaFromProps = props.column.colDef.userProvided?.formula;
    if (formulaFromProps !== undefined && formulaFromProps !== formula) {
      setFormula(formulaFromProps);
    }
  }, [props.column.colDef.userProvided?.formula]);

  const handleFormulaChange = (newFormula: string) => {
    if (props.onColumnFormulaUpdate) {
      props.onColumnFormulaUpdate(props.column.colDef.field, newFormula);
    }
    setFormula(newFormula);
    setIsDialogOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.onColumnDelete) {
      props.onColumnDelete(props.column.colDef.field);
    }
  };

  return (
    <div 
      className="ag-header-cell-label flex flex-col items-start p-1 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="font-medium w-full flex items-center justify-between">
        <span>{props.column.colDef.headerComponentParams?.displayName || props.displayName}</span>
        {isHovered && props.onColumnDelete && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
            title="Delete column"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        )}
      </div>
      <div 
        className={`text-xs cursor-pointer flex items-center gap-1 w-full transition-colors duration-200 ${
          isHovered ? 'text-blue-500' : 'text-gray-400'
        } ${formula ? 'bg-gray-50' : ''}`}
        onClick={() => setIsDialogOpen(true)}
      >
        <span className="font-mono font-medium">ƒx</span>
        <span className="truncate max-w-[150px] py-0.5">
          {formula ? `=(${formula})` : 'Click to add formula'}
        </span>
      </div>

      <FormulaDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleFormulaChange}
        initialFormula={formula}
        columnName={props.displayName}
        availableColumns={props.columnDefs}
      />
    </div>
  );
};

const QueryTable: React.FC<QueryTableProps> = ({ 
  initialRowData, 
  initialColumnDefs, 
  onColumnFormulaUpdate,
  onColumnDelete,
  ...props 
}) => {
  const [rowData, setRowData] = useState<any[]>(initialRowData);
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>(initialColumnDefs);
  const [pendingViewConfig, setPendingViewConfig] = useState<ViewConfig | null>(null);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    setRowData(initialRowData);
    setColumnDefs(initialColumnDefs);
  }, [initialRowData, initialColumnDefs]);

  useEffect(() => {
    if (pendingViewConfig && gridRef.current?.api) {
  
      // Directly apply the agGridFilterModel from the API response.
      if (pendingViewConfig.agGridFilterModel) {
        gridRef.current.api.setFilterModel(pendingViewConfig.agGridFilterModel);
      }
      
      setPendingViewConfig(null);
    }
  }, [columnDefs, pendingViewConfig]);

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
        className="fixed bg-white shadow-lg rounded-md border border-gray-200 max-h-48 overflow-y-auto"
        style={{
          top: `${inputRect.bottom + window.scrollY + 4}px`,
          left: `${inputRect.left + window.scrollX}px`,
          minWidth: '200px',
          zIndex: 9999
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

  // Update how we prepare column definitions
  const prepareColumnDefs = useMemo(() => {
    return columnDefs.map(col => ({
      ...col,
      headerComponent: FormulaHeaderComponent,
      headerComponentParams: {
        onColumnFormulaUpdate,
        onColumnDelete,
        columnDefs,
        displayName: col.headerName,
      },
      // Store formula in userProvided - handle both direct formula and formula from custom columns
      userProvided: {
        formula: col.formula || (col as any).userProvided?.formula
      },
      // Other default properties
      filter: true,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 200,
    }));
  }, [columnDefs, onColumnFormulaUpdate, onColumnDelete]);

  return (
    <div className="p-2">
      <div className="ag-theme-alpine w-[85vw] h-[80vh]">
        <AgGridReact 
          ref={gridRef}
          rowData={rowData} 
          columnDefs={prepareColumnDefs}
          columnTypes={{
            string: {
              filter: 'agTextColumnFilter',
              cellDataType: 'text',
            },
            number: {
              filter: 'agNumberColumnFilter',
              cellDataType: 'number',
            },
            date: {
              filter: 'agDateColumnFilter',
              cellDataType: 'date',
            },
            boolean: {
              filter: 'agTextColumnFilter',
              cellDataType: 'boolean',
            }
          }}
          defaultColDef={{
            filter: true,
            sortable: true,
            resizable: true,
            flex: 1,
            minWidth: 200,
          }}
          {...props}
        />
      </div>
    </div>
  );
};

export default QueryTable;
