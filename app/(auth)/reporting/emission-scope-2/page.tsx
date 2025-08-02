'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToastContainer, toast } from 'react-toastify';
import { api } from '@/lib/api' 
import { useEffect } from 'react';
import { Recycle, Zap } from 'lucide-react';
import QueryTable from '@/components/table/QueryTable';
import { ColumnWithType } from '@/components/table/QueryTable';
import { InsightLoader } from '@/components/ui/loader';


interface EmissionScope2Response {
  total_consumption: number;
  total_co2_emission: number;
  data: Array<Record<string, string | number>>;
}

export default function EmissionScope2Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>([]);
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
        },
        ...Object.keys(emissionsData.data[0])
          .filter(key => !['Document Name', 'Document ID'].includes(key))
          .map((key) => ({
            field: key,
            headerName: key,
            type: 'number' as const,
          } as ColumnWithType))
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
      <div className="w-full h-[600px]">
        <QueryTable
          initialRowData={rowData}
          initialColumnDefs={columnDefs}
        />
      </div>
      {loading && (
        <InsightLoader size="default" />
      )}
      <ToastContainer />
    </div>
  )
}
