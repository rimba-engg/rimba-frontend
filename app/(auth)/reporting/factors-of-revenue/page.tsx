'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DateTime } from 'luxon';
import { type FactorsOfRevenueResponse, type FactorsOfRevenueData, type ExtendedColumnWithType } from './types';
import { ToastContainer, toast } from 'react-toastify';
import { Loader2, Search } from 'lucide-react';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import QueryTable from '@/components/table/QueryTable';
import { Button } from '@/components/ui/button';

function numberFormatter(params: any) {
  if (params.value == null) {
    return '';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: params.colDef.field.includes('%') ? 1 : 1,
    maximumFractionDigits: params.colDef.field.includes('%') ? 1 : 1
  }).format(params.value);
}

const initialColumnDefs: ExtendedColumnWithType[] = [
  { 
    field: 'gasDay', 
    headerName: 'Gas Day',
    type: 'date',
    minWidth: 120,
    maxWidth: 120,
    headerClass: 'ag-center-header'
  },
  {
    field: '%Balance',
    headerName: '% Balance',
    type: 'number',
    minWidth: 120,
    maxWidth: 120,
    headerClass: 'ag-center-header'
  },
  {
    field: 'inletActual',
    headerName: 'Inlet MMBtu',
    type: 'number',
    minWidth: 300,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'inletActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'inletBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'inletDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      }
    ]
  },
  {
    field: 'downtimeActual',
    headerName: 'Downtime MMBtu',
    type: 'number',
    minWidth: 300,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'downtimeActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'downtimeBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'downtimeDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      }
    ]
  },
  {
    field: 'methaneSlipActual',
    headerName: 'Methane Slip (MMBtu)',
    type: 'number',
    minWidth: 300,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'methaneSlipActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'methaneSlipBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'methaneSlipDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      }
    ]
  },
  {
    field: 'meteringErrorActual',
    headerName: 'Metering Error',
    type: 'number',
    minWidth: 300,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'meteringErrorActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'meteringErrorBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'meteringErrorDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      }
    ]
  },
  {
    field: 'injectedActual',
    headerName: 'Injected MMBtu',
    type: 'number',
    minWidth: 300,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'injectedActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'injectedBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'injectedDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      }
    ]
  },
  {
    field: 'downtimeMinutesActual',
    headerName: 'Downtime Minutes',
    type: 'number',
    minWidth: 200,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'downtimeMinutesActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'downtimeMinutesBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 100,
        headerClass: 'ag-center-header'
      }
    ]
  }
];

export default function FactorsOfRevenuePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [columnDefs, setColumnDefs] = useState(initialColumnDefs);

  const handleSearch = () => {
    const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
    if (!selected_site?.name) {
      toast.error('Please select a site');
      return;
    }
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    fetchFactorsOfRevenueData();
  };

  const fetchFactorsOfRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
      if (!selected_site?.name) {
        throw new Error('No site selected');
      }

      const payload = {
        site_name: selected_site.name,
        start_datetime: startDate,
        end_datetime: endDate
      };

      const response = await api.post<FactorsOfRevenueResponse>('/reporting/v2/factors-of-revenue/', payload);

      if (response.status === 'error' || !response.data) {
        throw new Error(response.message);
      }

      // Transform the data to match the table structure
      const transformedData = response.data.map(item => ({
        gasDay: item.gasDay,
        '%Balance': item['%Balance'],
        inletActual: item.metrics['Inlet MMBtu'].actual,
        inletBudget: item.metrics['Inlet MMBtu'].budget,
        inletDelta: item.metrics['Inlet MMBtu'].delta,
        downtimeActual: item.metrics['Downtime MMBtu'].actual,
        downtimeBudget: item.metrics['Downtime MMBtu'].budget,
        downtimeDelta: item.metrics['Downtime MMBtu'].delta,
        methaneSlipActual: item.metrics['Methane Slip MMBtu'].actual,
        methaneSlipBudget: item.metrics['Methane Slip MMBtu'].budget,
        methaneSlipDelta: item.metrics['Methane Slip MMBtu'].delta,
        meteringErrorActual: item.metrics['Metering Error']?.actual ?? null,
        meteringErrorBudget: item.metrics['Metering Error']?.budget ?? null,
        meteringErrorDelta: item.metrics['Metering Error']?.delta ?? null,
        injectedActual: item.metrics['Injected MMBtu'].actual,
        injectedBudget: item.metrics['Injected MMBtu'].budget,
        injectedDelta: item.metrics['Injected MMBtu'].delta,
        downtimeMinutesActual: item.metrics['Downtime Minutes'].actual,
        downtimeMinutesBudget: item.metrics['Downtime Minutes'].budget,
      }));

      // Check if any row has metering error data
      const hasMeteringError = transformedData.some(row => 
        row.meteringErrorActual !== null || 
        row.meteringErrorBudget !== null || 
        row.meteringErrorDelta !== null
      );

      // Update column definitions based on data
      const updatedColumnDefs = [...initialColumnDefs];
      const meteringErrorColumnIndex = updatedColumnDefs.findIndex(col => 
        col.field === 'meteringErrorActual'
      );
      
      if (meteringErrorColumnIndex !== -1 && !hasMeteringError) {
        updatedColumnDefs.splice(meteringErrorColumnIndex, 1);
      }

      setRowData(transformedData);
      setColumnDefs(updatedColumnDefs);
      
      toast.success('Data loaded successfully');
    } catch (err) {
      setError('Failed to load factors of revenue data');
      console.error('Error fetching factors of revenue data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleSiteChange = () => {
      // Just reset the data when site changes
      setRowData([]);
      setError(null);
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    return () => window.removeEventListener('siteChange', handleSiteChange);
  }, []);

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
            <Loader2 className="animate-spin" size={24} />
            <div className="text-lg font-medium">Loading data...</div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Factors of Revenue</h1>
          
          <div className="flex gap-4 mb-6 items-end">
            <FloatingLabelInput
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-48"
            />
            <FloatingLabelInput
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-48"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="flex gap-2 items-center"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="h-[600px] w-full bg-white rounded-lg shadow-sm border">
              {rowData.length > 0 ? (
                <QueryTable
                  initialRowData={rowData}
                  initialColumnDefs={columnDefs}
                  pagination={true}
                  paginationPageSize={25}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                    suppressMovable: true
                  }}
                  domLayout="autoHeight"
                  rowHeight={40}
                  headerHeight={40}
                  suppressColumnVirtualisation={true}
                  animateRows={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data to display. Please select a date range and click Search.
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
