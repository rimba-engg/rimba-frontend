'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { type FactorsOfRevenueResponse, type ExtendedColumnWithType } from './types';
import { ToastContainer, toast } from 'react-toastify';
import { Loader2, Search } from 'lucide-react';
import QueryTable from '@/components/table/QueryTable';
import { Button } from '@/components/ui/button';

// Add a function to style delta cells
function deltaCellStyle(params: any): { backgroundColor: string; color: string } {
  if (params.value == null) return { backgroundColor: '', color: '' };
  return {
    backgroundColor: params.value > 0 ? '#e6ffe6' : params.value < 0 ? '#ffe6e6' : '',
    color: params.value > 0 ? '#006600' : params.value < 0 ? '#cc0000' : ''
  };
}

function negativeDeltaCellStyle(params: any): { backgroundColor: string; color: string } {
  // if value is negative, make the cell *GREEN*! Yes this is intentional
  if (params.value == null) return { backgroundColor: '', color: '' };
  return {
    backgroundColor: params.value < 0 ? '#e6ffe6' : params.value > 0 ? '#ffe6e6' : '',
    color: params.value < 0 ? '#006600' : params.value > 0 ? '#cc0000' : ''
  };
}

const initialColumnDefs: ExtendedColumnWithType[] = [
  { 
    field: 'gasDay', 
    headerName: 'Gas Day',
    type: 'string',
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
    minWidth: 250,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'inletActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'inletBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'inletDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header',
        cellStyle: deltaCellStyle
      }
    ]
  },
  {
    field: 'downtimeActual',
    headerName: 'Downtime MMBtu',
    type: 'number',
    minWidth: 250,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'downtimeActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'downtimeBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'downtimeDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header',
        cellStyle: negativeDeltaCellStyle
      }
    ]
  },
  {
    field: 'toxActual',
    headerName: 'Tox MMBtu',
    type: 'number',
    minWidth: 250,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'toxActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'toxBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'toxDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header',
        cellStyle: negativeDeltaCellStyle
      }
    ]
  },
  {
    field: 'injectedActual',
    headerName: 'Injected MMBtu',
    type: 'number',
    minWidth: 250,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'injectedActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'injectedBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'injectedDelta', 
        headerName: 'Delta', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header',
        cellStyle: deltaCellStyle
      }
    ]
  },
  {
    field: 'downtimeMinutesActual',
    headerName: 'Downtime Minutes',
    type: 'number',
    minWidth: 180,
    headerClass: 'ag-center-header',
    children: [
      { 
        field: 'downtimeMinutesActual', 
        headerName: 'Actual', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      { 
        field: 'downtimeMinutesBudget', 
        headerName: 'Budget', 
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header'
      },
      {
        field: 'downtimeMinutesDelta',
        headerName: 'Delta',
        type: 'number',
        minWidth: 80,
        headerClass: 'ag-center-header',
        cellStyle: negativeDeltaCellStyle
      }
    ]
  }
];

// Define the row style based on whether the row is pinned
const getRowStyle = (params: any): { backgroundColor: string; fontWeight: string } | undefined => {
  if (params.node.rowPinned) {
    return { backgroundColor: '#f5f5f5', fontWeight: 'bold' };
  }
  return undefined;
};

export default function FactorsOfRevenuePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({});
  const [startMonth, setStartMonth] = useState<number>(new Date().getMonth());
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState<number>(new Date().getMonth());
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    // Fetch data on component mount if site is selected
    const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
    if (selected_site?.name) {
      fetchFactorsOfRevenueData();
    }
  }, []); // Run once on component mount

  const handleSearch = () => {
    const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
    if (!selected_site?.name) {
      toast.error('Please select a site');
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

      const startDate = new Date(startYear, startMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(endYear, endMonth + 1, 0).toISOString().split('T')[0];

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
        toxActual: item.metrics['Tox MMBtu'].actual,
        toxBudget: item.metrics['Tox MMBtu'].budget,
        toxDelta: item.metrics['Tox MMBtu'].delta,
        injectedActual: item.metrics['Injected MMBtu'].actual,
        injectedBudget: item.metrics['Injected MMBtu'].budget,
        injectedDelta: item.metrics['Injected MMBtu'].delta,
        downtimeMinutesActual: item.metrics['Downtime Minutes'].actual,
        downtimeMinutesBudget: item.metrics['Downtime Minutes'].budget,
        downtimeMinutesDelta: item.metrics['Downtime Minutes'].delta,
      }));

      const transformedTotals = {
        gasDay: response.totals.gasDay,
        '%Balance': response.totals['%Balance'],
        inletActual: response.totals.metrics['Inlet MMBtu'].actual,
        inletBudget: response.totals.metrics['Inlet MMBtu'].budget,
        inletDelta: response.totals.metrics['Inlet MMBtu'].delta,
        downtimeActual: response.totals.metrics['Downtime MMBtu'].actual,
        downtimeBudget: response.totals.metrics['Downtime MMBtu'].budget,
        downtimeDelta: response.totals.metrics['Downtime MMBtu'].delta,
        toxActual: response.totals.metrics['Tox MMBtu'].actual,
        toxBudget: response.totals.metrics['Tox MMBtu'].budget,
        toxDelta: response.totals.metrics['Tox MMBtu'].delta,
        injectedActual: response.totals.metrics['Injected MMBtu'].actual,
        injectedBudget: response.totals.metrics['Injected MMBtu'].budget,
        injectedDelta: response.totals.metrics['Injected MMBtu'].delta,
        downtimeMinutesActual: response.totals.metrics['Downtime Minutes'].actual,
        downtimeMinutesBudget: response.totals.metrics['Downtime Minutes'].budget,
        downtimeMinutesDelta: response.totals.metrics['Downtime Minutes'].delta,
      };

      setTotals(transformedTotals);
      setRowData(transformedData);
      
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

  // Helper function to get month options
  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString('default', { month: 'long' })
    }));
  };

  // Helper function to get year options
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({
      value: currentYear - i,
      label: (currentYear - i).toString()
    }));
  };

  return (
    <div className="p-4">
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
            <div className="flex flex-col">
              <label className="mb-1">Start Month</label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="w-48 p-2 border rounded"
              >
                {getMonthOptions().map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1">Start Year</label>
              <select
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-48 p-2 border rounded"
              >
                {getYearOptions().map((year) => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1">End Month</label>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                className="w-48 p-2 border rounded"
              >
                {getMonthOptions().map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1">End Year</label>
              <select
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="w-48 p-2 border rounded"
              >
                {getYearOptions().map((year) => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </div>
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
                  initialColumnDefs={initialColumnDefs}
                  pinnedTopRowData={[totals]}
                  getRowStyle={getRowStyle}
                  autoSizeStrategy={{
                    type: "fitCellContents",
                  }}
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
        position="bottom-right"
        autoClose={2000}
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
