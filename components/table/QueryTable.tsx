// pages/table.js
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
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

const QueryTable = () => {
  const [query, setQuery] = useState<string>("");
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColumnDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  // State to hold pending view configuration (sorting + filtering)
  const [pendingViewConfig, setPendingViewConfig] = useState<ViewConfig | null>(null);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    const generateRandomData = (numRows: number) => {
      const data = [];
      for (let i = 1; i <= numRows; i++) {
        const received = Math.floor(Math.random() * 1000) + 1;
        const supplied = Math.floor(Math.random() * received);
        data.push({ id: i, received, supplied });
      }
      return data;
    };

    const data = generateRandomData(100); // Change 10 to any number of rows you want to generate
    setRowData(data);

    const columns: ColumnDefinition[] = [
      { headerName: "ID", field: "id" },
      { headerName: "Received", field: "received" },
      { headerName: "Supplied", field: "supplied" }
    ];
    setColumnDefs(columns);
  }, []);

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

  // Simulate an API call by mocking the response from the LLM.
  const handleQuerySubmit = async () => {
    setLoading(true);

    // Updated mock response supports multiple new columns, sorting and filtering criteria.
    const mockResponse: APIResponse = {
      newColumns: [
        {
          headerName: "Flag",
          field: "flag",
          formula: "return (Math.abs(row.received - row.supplied) / row.received > 0.55) ? 'Flagged' : 'OK';"
        },
        {
          headerName: "Difference",
          field: "difference",
          formula: "return (Math.abs(row.received - row.supplied) / row.received) * 100;"
        }
        // You can add additional new column definitions here.
      ],
      viewConfig: {
        sorting: [
          { field: "id", order: "asc" }
          // Add more sorting configurations if needed.
        ],
        filtering: [
          { field: "flag", criteria: "Flagged" }
          // You can add additional filter criteria here.
        ]
      }
    };

    // Simulate API delay
    setTimeout(() => {
      applyChangesToTable(mockResponse);
      setLoading(false);
    }, 1000);
  };

  // Apply changes to the table based on API response
  const applyChangesToTable = (response: APIResponse) => {
    let updatedRows = [...rowData];
    let updatedColumns = [...columnDefs];

    // Process each new column
    if (response.newColumns) {
      response.newColumns.forEach(newCol => {
        // Only add if the column doesn't already exist
        if (!updatedColumns.find(col => col.field === newCol.field)) {
          updatedColumns.push({ headerName: newCol.headerName, field: newCol.field });
        }
        // Map all rows to include the computed column value.
        updatedRows = updatedRows.map(row => ({
          ...row,
          [newCol.field]: computeFormula(newCol.formula, row)
        }));
      });
    }

    // Store the view configuration (which may include multiple sorting and filtering definitions)
    if (response.viewConfig) {
      setPendingViewConfig(response.viewConfig);
    }

    setColumnDefs(updatedColumns);
    setRowData(updatedRows);
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
    <div style={{ padding: 20 }}>
      <h1>Data Table with Natural Language Query</h1>
      <TableComponent 
        rowData={rowData} 
        columnDefs={columnDefs} 
        ref={gridRef}
      />
      <div style={{ marginTop: 20 }}>
        <textarea 
          placeholder="Enter your query..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={4}
          cols={50}
        />
        <br />
        <button onClick={handleQuerySubmit} disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Processing...' : 'Submit Query'}
        </button>
      </div>
    </div>
  );
};

export default QueryTable;
