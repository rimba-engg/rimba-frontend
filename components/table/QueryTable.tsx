// pages/table.js
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy"});

// Interfaces for API response and related data types
interface NewColumn {
  headerName: string;
  field: string;
  formula: string;
}

interface SortingConfig {
  field: string;
  order: 'asc' | 'desc';
}

interface FilteringConfig {
  field: string;
  criteria: string;
}

interface ViewConfig {
  sorting?: SortingConfig[];
  filtering?: FilteringConfig[];
}

interface APIResponse {
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
}

// New interface for QueryTable props to pass in table data
interface QueryTableProps {
  initialRowData: any[];
  initialColumnDefs: ColumnWithType[];
}

const TableComponent = React.forwardRef(({
  rowData,
  columnDefs
}: {
  rowData: any[];
  columnDefs: ColumnDefinition[];
}, ref: any) => {
  return (
    <div className="ag-theme-alpine w-[80vw] h-[600px]">
      <AgGridReact 
        ref={ref}
        rowData={rowData} 
        columnDefs={columnDefs}
        defaultColDef={{
          filter: true,
          sortable: true,
          resizable: true,
          flex: 1,
          minWidth: 200,
        }}
      />
    </div>
  );
});

const QueryTable: React.FC<QueryTableProps> = ({ initialRowData, initialColumnDefs }) => {
  // Initialize state using props
  const [query, setQuery] = useState<string>("");
  const [rowData, setRowData] = useState<any[]>(initialRowData);
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>(initialColumnDefs);
  const [loading, setLoading] = useState(false);
  // State to hold pending view configuration (sorting + filtering)
  const [pendingViewConfig, setPendingViewConfig] = useState<ViewConfig | null>(null);
  const gridRef = useRef<any>(null);

  // Add these new states for preview mode
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [previewResponse, setPreviewResponse] = useState<APIResponse | null>(null);
  const [previewRowCount, setPreviewRowCount] = useState<number>(10); // Preview first 10 rows
  const [originalRowData, setOriginalRowData] = useState<any[]>([]);
  const [originalColumnDefs, setOriginalColumnDefs] = useState<ColumnWithType[]>([]);

  // Computes the result for a new column using a formula.
  const computeFormula = (formula: string, row: any): any => {
    try {
      const fn = new Function("row", formula);
      return fn(row);
    } catch (error) {
      console.error("Error evaluating formula:", error);
      return null;
    }
  };

  // Actual API request function using the api client  
  const fetchQueryResults = async (
    userQuery: string, 
    tableSchema: ColumnWithType[]
  ): Promise<APIResponse> => {
    // Create the request payload
    const payload = {
      query: userQuery,
      tableSchema: tableSchema.map(col => ({
        field: col.field,
        headerName: col.headerName,
        type: col.type,
        sample: col.sample || getSampleValueForColumn(col.field, rowData)
      })),
      // Optionally include a sample of the data
      sampleData: rowData.slice(0, 5)
    };

    console.log("API Payload:", JSON.stringify(payload, null, 2));

    // Make the actual API call to '/v2/table-query/' using our API client.
    const response = await api.post<APIResponse>("/reporting/v2/table-query/", payload);
    return response;
  };
  
  // Helper function to get a sample value for a column
  const getSampleValueForColumn = (field: string, data: any[]): any => {
    if (data.length === 0) return null;
    return data[0][field];
  };

  // Updated query submit handler to call the API
  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      alert("Please enter a query");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetchQueryResults(query, columnDefs);
      
      // Store original data before preview
      setOriginalRowData([...rowData]);
      setOriginalColumnDefs([...columnDefs]);
      
      // Store the response for later use if user confirms
      setPreviewResponse(response);
      
      // Apply preview changes only to a subset (first previewRowCount rows)
      applyChangesToPreview(response, previewRowCount);
      
      setPreviewMode(true);
    } catch (error) {
      console.error("Error fetching query results:", error);
      alert("An error occurred while processing your query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply changes to only a subset of rows for preview
  const applyChangesToPreview = (response: APIResponse, previewCount: number) => {
    let updatedRows = [...rowData];
    let updatedColumns = [...columnDefs];
    
    // Process each new column
    if (response.newColumns) {
      response.newColumns.forEach(newCol => {
        // Only add if the column doesn't already exist
        if (!updatedColumns.find(col => col.field === newCol.field)) {
          updatedColumns.push({ headerName: newCol.headerName, field: newCol.field, type: 'number' });
        }
        
        // Apply formula only to the first previewCount rows
        updatedRows = updatedRows.map((row, index) => {
          if (index < previewCount) {
            return {
              ...row,
              [newCol.field]: computeFormula(newCol.formula, row)
            };
          }
          return row;
        });
      });
    }

    // Store the view configuration but don't apply it yet
    if (response.viewConfig) {
      setPendingViewConfig(response.viewConfig);
    }

    setColumnDefs(updatedColumns);
    setRowData(updatedRows);
  };

  // Apply changes to all rows
  const applyChangesToAllRows = () => {
    if (!previewResponse) return;
    
    let updatedRows = [...rowData];
    
    // Process each new column for all rows
    if (previewResponse.newColumns) {
      previewResponse.newColumns.forEach(newCol => {
        // Apply formula to all rows
        updatedRows = updatedRows.map(row => {
          // Skip rows that already have the computed value
          if (row[newCol.field] !== undefined) {
            return row;
          }
          return {
            ...row,
            [newCol.field]: computeFormula(newCol.formula, row)
          };
        });
      });
    }

    setRowData(updatedRows);
    setPreviewMode(false);
    setPreviewResponse(null);
  };

  // Revert changes
  const revertChanges = () => {
    setRowData(originalRowData);
    setColumnDefs(originalColumnDefs);
    setPendingViewConfig(null);
    setPreviewMode(false);
    setPreviewResponse(null);
  };

  // Apply the pending view configuration once the grid has registered the new columns.
  useEffect(() => {
    if (pendingViewConfig && gridRef.current?.api) {
      // Apply sorting if available.
    //   if (pendingViewConfig.sorting) {
    //     const sortModel = pendingViewConfig.sorting
    //       .filter(sort => gridRef.current.api.getColumnDef(sort.field))
    //       .map(sort => ({
    //         colId: sort.field,
    //         sort: sort.order.toLowerCase()
    //       }));
    //     gridRef.current.api.setSortModel(sortModel);
    //   }

      // Apply filtering if available.
      if (pendingViewConfig.filtering) {
        const filterModel: any = {};
        pendingViewConfig.filtering.forEach(filter => {
          if (gridRef.current.api.getColumnDef(filter.field)) {
            filterModel[filter.field] = {
              filterType: 'text',
              type: 'equals',
              filter: filter.criteria
            };
          }
        });
        gridRef.current.api.setFilterModel(filterModel);
      }
      setPendingViewConfig(null);
    }
  }, [columnDefs, pendingViewConfig]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Table with Natural Language Query</h1>
      <TableComponent 
        rowData={rowData} 
        columnDefs={columnDefs} 
        ref={gridRef}
      />
      
      {previewMode && (
        <div className="mt-4 p-4 bg-background border rounded-md shadow-sm">
          <p className="text-sm">Changes have been applied to the first {previewRowCount} rows as a preview.</p>
          <div className="flex gap-2 mt-2">
            <Button 
              onClick={applyChangesToAllRows}
              variant="default"
            >
              Apply to All Rows
            </Button>
            <Button 
              onClick={revertChanges}
              variant="destructive"
            >
              Revert Changes
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 space-y-2">
        <div className="flex flex-col">
          <label htmlFor="query-input" className="text-sm font-medium mb-1">
            Enter your natural language query:
          </label>
          <textarea 
            id="query-input"
            className="flex w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Example: Show me all rows where the difference between received and supplied is more than 50%"
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={4}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {loading ? 'Sending query to API...' : 'Your query will be processed by our AI to generate table transformations.'}
          </p>
          <Button 
            onClick={handleQuerySubmit} 
            disabled={loading || previewMode || !query.trim()}
            className="mt-2"
          >
            {loading ? 'Processing...' : 'Submit Query'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QueryTable;
