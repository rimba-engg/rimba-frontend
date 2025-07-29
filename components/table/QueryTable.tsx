// pages/table.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import { AllEnterpriseModule, SparklinesModule, LicenseManager, IntegratedChartsModule, ExcelExportModule, MasterDetailModule } from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import { AllCommunityModule, CsvExportModule, ClientSideRowModelModule, ModuleRegistry, provideGlobalGridOptions, themeBalham } from 'ag-grid-community';

// Register all community features
ModuleRegistry.registerModules([
  AllCommunityModule,
  AllEnterpriseModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  SparklinesModule.with(AgChartsEnterpriseModule),
  ClientSideRowModelModule,
  CsvExportModule,
  ExcelExportModule,
  MasterDetailModule
]);
LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY || '');

provideGlobalGridOptions({ theme: themeBalham, sideBar: {toolPanels: ['columns', 'filters'], hiddenByDefault: true}, suppressContextMenu: false});


interface NewColumn {
  headerName: string;
  field: string;
  formula?: string;
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
  sample?: any;
  field?: string; // Make field optional since group columns don't need it
  groupId?: string;
  children?: ColumnWithType[];
  cellRenderer?: string;
  cellRendererParams?: any;
}

// New interface for QueryTable props to pass in table data
interface QueryTableProps extends AgGridReactProps {
  initialRowData: any[];
  initialColumnDefs: ColumnWithType[];
}

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
      wrapHeaderText: true,
      autoHeaderHeight: true,
      flex: 1,
      minWidth: 100,
    }));
  }, [columnDefs]);

  return (
    <div className="w-[85vw] h-[80vh] p-4">
      <AgGridReact 
        ref={gridRef}
        rowData={rowData} 
        columnDefs={prepareColumnDefs}
        enableCharts={true}
        cellSelection={true}
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
        }}
        statusBar={{
          statusPanels: [
            {
              statusPanel: 'agAggregationComponent',
              statusPanelParams: {
                aggFuncs: ['sum', 'avg', 'min', 'max'],
              },
            },
          ],
        }}
        {...props}
      />
    </div>
  );
};

export default QueryTable;
