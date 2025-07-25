// pages/table.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ColDef, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy"});

// Updated interfaces for API response and related types
interface NewColumn {
  headerName: string;
  field: string;
  formula?: string;  // Added formula as an optional property
}

interface SortingConfig {
  field: string;
  order: 'asc' | 'desc';
}

interface AgGridColumnFilter {
  filterType: string;
  type: string;
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
  field?: string;
}

// Add this interface for column type information
export interface ColumnWithType extends ColumnDefinition {
  type: 'string' | 'number' | 'boolean' | 'date';
  sample?: any;
  field?: string; // Make field optional since group columns don't need it
  groupId?: string;
  children?: ColumnWithType[];
}

// New interface for QueryTable props to pass in table data
interface QueryTableProps extends AgGridReactProps {
  initialRowData: any[];
  initialColumnDefs: ColumnWithType[];
}

const removeTypeFromColumnDefs = (columnDefs: ColDef<any, any>[]): ColDef<any, any>[] => {
  return columnDefs.map(({ type, ...rest }) => rest);
};

const QueryTable: React.FC<QueryTableProps> = ({ 
  initialRowData, 
  initialColumnDefs,
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

  // Update how we prepare column definitions
  const prepareColumnDefs = useMemo(() => {
    return columnDefs.map(col => ({
      ...col,
      // Other default properties
      filter: true,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 200,
    }));
  }, [columnDefs]);

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
