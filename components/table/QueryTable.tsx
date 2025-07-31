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
  type?: string;
  headerTooltip?: string;
  [key: string]: any; // Allow additional AG Grid props
}

// New interface for QueryTable props to pass in table data
interface QueryTableProps extends AgGridReactProps {
  initialRowData: any[];
  initialColumnDefs: ColumnWithType[];
  formulas?: Record<string, string>;
  onFormulaUpdate?: (field: string, formula: string) => void;
}

const QueryTable: React.FC<QueryTableProps> = ({ 
  initialRowData, 
  initialColumnDefs,
  formulas = {},
  onFormulaUpdate,
  ...props 
}) => {
  const [rowData, setRowData] = useState<any[]>(initialRowData);
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>(initialColumnDefs);
  const [pendingViewConfig, setPendingViewConfig] = useState<ViewConfig | null>(null);
  const gridRef = useRef<any>(null);

  // modal state
  const [editField, setEditField] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<string>('');

  const closeModal = () => setEditField(null);
  const saveFormula = () => {
    if (editField && onFormulaUpdate) {
      onFormulaUpdate(editField, editValue);
    }
    closeModal();
  };

  // Handler to show formula on header click
  const handleHeaderClick = React.useCallback((params: any) => {
    // prevent default sort when clicking to view formula
    if (params.event) {
      params.event.preventDefault?.();
      params.event.stopPropagation?.();
    }
    const field = params.column?.getColDef()?.field;
    if (field && formulas[field]) {
      setEditField(field);
      setEditValue(formulas[field] ?? '');
    }

    // Preserve any user-supplied handler
    if (typeof (props as any).onColumnHeaderClicked === 'function') {
      (props as any).onColumnHeaderClicked(params);
    }
  }, [formulas, props]);

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
    }));
  }, [columnDefs]);
  
  return (
    <div className="h-[80vh] p-4">
      <AgGridReact
        ref={gridRef}
        autoSizeStrategy={{
          type: "fitCellContents",
          skipHeader: true,
          defaultMinWidth: 120,
        }}
        rowData={rowData}
        columnDefs={prepareColumnDefs}
        enableCharts
        cellSelection
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
        onColumnHeaderClicked={handleHeaderClick}
      />
      {editField && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',padding:20,borderRadius:8,width:'90%',maxWidth:500}}>
            <h3 style={{marginBottom:10}}>Edit Formula for {editField}</h3>
            <textarea style={{width:'100%',height:120,border:'3px solid #22c55e',borderRadius:'4px',padding:'8px'}} value={editValue} onChange={e=>setEditValue(e.target.value)} />
            <div style={{marginTop:10,display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={closeModal} style={{padding:'6px 12px'}}>Cancel</button>
              <button onClick={saveFormula} style={{padding:'6px 12px',background:'#2563eb',color:'#fff'}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryTable;
