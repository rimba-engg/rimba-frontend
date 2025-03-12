// pages/table.js
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { MessageSquare, Table, Eye, Download } from 'lucide-react';
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
    <div className="ag-theme-alpine w-[85vw] h-[80vh]">
      <AgGridReact 
        ref={ref}
        rowData={rowData} 
        columnDefs={columnDefs}
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
            filter: 'agBooleanColumnFilter',
            cellDataType: 'boolean',
          }
        }}
        defaultColDef={{
          filter: true,
          sortable: true,
          resizable: true,
          flex: 1,
          minWidth: 200,
          type: ['string'], // Default to string type
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

  // NEW: State for Pivot Feature
  const [pivotOptions, setPivotOptions] = useState({
    groupBy: '',
    pivotColumn: '',
    valueColumn: '',
    aggregation: 'sum'
  });
  const [isPivotMode, setIsPivotMode] = useState(false);
  const [backupRowData, setBackupRowData] = useState<any[] | null>(null);
  const [backupColumnDefs, setBackupColumnDefs] = useState<ColumnWithType[] | null>(null);

  // Add new state for visible columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumnDefs.map(col => col.field))
  );

  // Update visible columns when initial columns change
  useEffect(() => {
    setVisibleColumns(new Set(initialColumnDefs.map(col => col.field)));
  }, [initialColumnDefs]);

  // Filter column definitions based on visibility
  const filteredColumnDefs = columnDefs.filter(col => visibleColumns.has(col.field));

  // Add this useEffect to update internal state when props change, with added debug logs
  useEffect(() => {
    console.log("QueryTable received new props:", { initialRowData, initialColumnDefs });
    setRowData(initialRowData);
    setColumnDefs(initialColumnDefs);
  }, [initialRowData, initialColumnDefs]);

  // Log current state when the table is rendered
  useEffect(() => {
    console.log("QueryTable internal state updated:", { rowData, columnDefs });
  }, [rowData, columnDefs]);

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
      console.log("Query response:", response);
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
    const newVisibleColumns = new Set(visibleColumns);
    
    // Process each new column
    if (response.newColumns) {
      response.newColumns.forEach(newCol => {
        // Only add if the column doesn't already exist
        if (!updatedColumns.find(col => col.field === newCol.field)) {
          updatedColumns.push({ headerName: newCol.headerName, field: newCol.field, type: 'string' });
          // Add new column to visible columns
          newVisibleColumns.add(newCol.field);
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

    // Update visible columns state with new columns
    setVisibleColumns(newVisibleColumns);

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

  // NEW: Pivot helper functions
  const pivotData = (data: any[], options: any) => {
    const { groupBy, pivotColumn, valueColumn, aggregation } = options;
    const groups: { [key: string]: any[] } = {};
    data.forEach(row => {
      const key = row[groupBy];
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    const pivotValuesSet = new Set();
    data.forEach(row => {
      pivotValuesSet.add(row[pivotColumn]);
    });
    const pivotValues = Array.from(pivotValuesSet);
    const newRows = [];
    for (const group in groups) {
      const groupedRows = groups[group];
      const newRow: any = { [groupBy]: group };
      pivotValues.forEach(pivotVal => {
        const rowsForPivot = groupedRows.filter(r => r[pivotColumn] === pivotVal);
        let aggregated;
        if (aggregation === 'sum') {
          aggregated = rowsForPivot.reduce((acc, cur) => acc + Number(cur[valueColumn] || 0), 0);
        } else if (aggregation === 'count') {
          aggregated = rowsForPivot.length;
        }
        newRow[pivotVal as string] = aggregated;
      });
      newRows.push(newRow);
    }
    const newColDefs: ColumnWithType[] = [ { headerName: groupBy, field: groupBy, type: 'string' } ];
    pivotValues.forEach(val => {
      newColDefs.push({ headerName: String(val), field: String(val), type: 'number' });
    });
    return { newRows, newColDefs };
  };

  const handlePivotApply = () => {
    if (!pivotOptions.groupBy || !pivotOptions.pivotColumn || !pivotOptions.valueColumn) {
      alert('Please select all pivot options');
      return;
    }
    if (!isPivotMode) {
      setBackupRowData(rowData);
      setBackupColumnDefs(columnDefs);
    }
    const { newRows, newColDefs } = pivotData(rowData, pivotOptions);
    
    // Show all pivot-generated columns by default
    setVisibleColumns(new Set(newColDefs.map(col => col.field)));
    
    setRowData(newRows);
    setColumnDefs(newColDefs);
    setIsPivotMode(true);
  };

  const handleClearPivot = () => {
    if (backupRowData && backupColumnDefs) {
      // Restore original visibility when clearing pivot
      setVisibleColumns(new Set(backupColumnDefs.map(col => col.field)));
      
      setRowData(backupRowData);
      setColumnDefs(backupColumnDefs);
      setBackupRowData(null);
      setBackupColumnDefs(null);
    }
    setIsPivotMode(false);
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

  // New: Function to export the current table data to CSV
  const handleExportCSV = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv();
    }
  };

  // Add column visibility handler
  const handleColumnVisibilityChange = (field: string, isVisible: boolean) => {
    const newVisible = new Set(visibleColumns);
    isVisible ? newVisible.add(field) : newVisible.delete(field);
    setVisibleColumns(newVisible);
  };

  return (
    <div className="p-2">
      {/* <h1 className="text-2xl font-bold mb-4">Data Table with Natural Language Query</h1> */}
      <div className="flex justify-between mb-2">
        <div className='flex'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="default"
                className="mr-4 gap-2"
                >
                <MessageSquare className="w-5 h-5" />
                <span>Ask AI</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4">
              <div className="space-y-2">
                <div className="flex flex-col">
                  {/* <label htmlFor="query-input" className="text-sm font-medium mb-1">
                    Enter your natural language query:
                    </label> */}
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
            </PopoverContent>
          </Popover>
          {/* NEW: Pivot Table Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" className="flex gap-2 items-center">
                <Table className="w-5 h-5" />
                <span>Pivot View</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Group By</label>
                  <select
                    value={pivotOptions.groupBy}
                    onChange={(e) => setPivotOptions({ ...pivotOptions, groupBy: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    >
                    <option value="">Select Column</option>
                    {columnDefs.map(col => (
                      <option key={col.field} value={col.field}>{col.headerName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pivot Column</label>
                  <select
                    value={pivotOptions.pivotColumn}
                    onChange={(e) => setPivotOptions({ ...pivotOptions, pivotColumn: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    >
                    <option value="">Select Column</option>
                    {columnDefs.map(col => (
                      <option key={col.field} value={col.field}>{col.headerName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value Column</label>
                  <select
                    value={pivotOptions.valueColumn}
                    onChange={(e) => setPivotOptions({ ...pivotOptions, valueColumn: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    >
                    <option value="">Select Column</option>
                    {columnDefs.map(col => (
                      <option key={col.field} value={col.field}>{col.headerName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Aggregation</label>
                  <select
                    value={pivotOptions.aggregation}
                    onChange={(e) => setPivotOptions({ ...pivotOptions, aggregation: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    >
                    <option value="sum">Sum</option>
                    <option value="count">Count</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  {isPivotMode ? (
                    <Button onClick={handleClearPivot} variant="destructive">
                      Clear Pivot
                    </Button>
                  ) : (
                    <Button onClick={handlePivotApply} variant="default">
                      Apply Pivot
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* New Column Visibility Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" className="flex gap-2 items-center ml-2">
                <Eye className="w-5 h-5" />
                <span>Filter Columns</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Visible Columns</h4>
                <div className="space-y-1">
                  {columnDefs.map(col => (
                    <label key={col.field} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.field)}
                        onChange={(e) => handleColumnVisibilityChange(col.field, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{col.headerName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex">
          <Button onClick={handleExportCSV} variant="default" className="ml-4 flex gap-2 items-center">
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
      <TableComponent 
        rowData={rowData} 
        columnDefs={filteredColumnDefs}
        ref={gridRef}
      />

      
    </div>
  );
};

export default QueryTable;
