'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToastContainer, toast } from 'react-toastify';
import { api } from '@/lib/api' 
import { useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
import { Recycle, Zap } from 'lucide-react';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy"});


interface EmissionScope2Response {
  total_consumption: number;
  total_co2_emission: number;
  data: Array<Record<string, string | number>>;
}

const defaultColDef = {
  flex: 1,
  minWidth: 200,
  resizable: true,
  sortable: true,
};

const DocumentLinkRenderer = (props: any) => {
  return (
    <a href={`/library/document?document_id=${props.data['Document ID']}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
      {props.data['Document Name']}
    </a>
  );
};

export default function EmissionScope2Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [columnDefs, setColumnDefs] = useState<Record<string, any>[]>([]);
  const [rowData, setRowData] = useState<Array<Record<string, any>>>([]);
  const [emissionsData, setEmissionsData] = useState<EmissionScope2Response>({
    total_consumption: 0,
    total_co2_emission: 0,
    data: []
  });

  // set column defs based on rowData
  useEffect(() => {
    if (emissionsData.data && emissionsData.data.length > 0) {
      setColumnDefs([
        {
          field: 'document_link',
          headerName: 'Document',
          sortable: true,
          resizable: true,
          minWidth: 300,
          cellRenderer: DocumentLinkRenderer,
        },
        ...Object.keys(emissionsData.data[0])
          .filter(key => !['Document Name', 'Document ID'].includes(key))
          .map((key) => ({
            field: key,
            headerName: key,
            sortable: true,
            resizable: true,
          }))
      ]);

      // need to add document link to the row data
      setRowData(emissionsData.data);
    }
  }, [emissionsData]);

  // fetch emissions data
  const fetchEmissionsData = async () => {
    setLoading(true);

    try {
      const response = await api.post<EmissionScope2Response>('/reporting/v2/emissions/scope2/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
      });

      setEmissionsData(response);  
    } catch (error) {
      console.error('Error fetching emissions data:', error);
      toast.error('Failed to fetch emissions data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmissionsData();
  }, []);

  return (
    <div className="container mx-auto">
      <CardHeader>
        <CardTitle>Scope 2 Emissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap size={24} className="text-muted-foreground" />
                Total Consumption
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${emissionsData?.total_consumption?.toLocaleString() || 0} MWh`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Recycle size={24} className="text-muted-foreground" />
                Total CO2 Emissions 
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${emissionsData?.total_co2_emission?.toLocaleString() || 0} lbs`}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <div className="ag-theme-alpine w-full h-[600px]">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
        />
      </div>
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}
