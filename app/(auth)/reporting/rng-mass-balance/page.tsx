'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { type GasBalanceView } from './types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from 'ag-grid-community';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Chart as ChartJS,
  ChartOptions,
  ChartData,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import { Info, Loader2 } from 'lucide-react';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy"});

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ViewsResponse {
  views: GasBalanceView[];
}

interface MassBalanceResponse {
  view_aggregate: Record<string, any>;
  view_data: Array<Record<string, any>>;
  full_precision_view_data_csv: string;
  chart_config: Record<string, any>;
  chart_title: string;
  tax_credit: Record<string, any>;
}

const defaultColDef = {
  flex: 1,
  minWidth: 200,
  resizable: true,
};

// Define the row style based on whether the row is pinned
const getRowStyle = (params: any): { backgroundColor: string; fontWeight: string } | undefined => {
  if (params.node.rowPinned) {
    return { backgroundColor: '#f5f5f5', fontWeight: 'bold' };
  }
  return undefined;
};

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

function numberFormatter(params: any) {
  if (params.value == null) {
      return '';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: params.colDef.field.includes('%') ? 1 : 0,
    maximumFractionDigits: params.colDef.field.includes('%') ? 1 : 0
  }).format(params.value);
}

export default function RngMassBalancePage() {
  const [views, setViews] = useState<GasBalanceView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnDefs, setColumnDefs] = useState<Record<string, any>[]>([]);
  const [rowData, setRowData] = useState<Array<Record<string, any>>>([]);
  const [fullPrecisionRowDataCsv, setFullPrecisionRowDataCsv] = useState<string>('');
  const [selectedView, setSelectedView] = useState<GasBalanceView | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewAggregate, setViewAggregate] = useState<Record<string, any>>({});
  const [chartConfig, setChartConfig] = useState<ChartData<"bar", (number | [number, number] | null)[], unknown> | null>(null);
  const [chartTitle, setChartTitle] = useState<string>('');
  const [taxCredit, setTaxCredit] = useState<Record<string, any>>({});
  const [showPrevailingWage, setShowPrevailingWage] = useState(true);

  // Initialize grid ref for accessing the grid API
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    fetchViews();
  }, []);

  useEffect(() => {
    // Set the first view as default when views are loaded
    if (views.length > 0 && !selectedView) {
      setSelectedView(views[0]);
    }
  }, [views, selectedView]);

  // Fetch data when view or dates change
  useEffect(() => {
    if (selectedView) {
      fetchMassBalanceData();
    }
  }, [selectedView, startDate, endDate]);

  // set column defs based on rowData
  useEffect(() => {
    if (rowData && rowData.length > 0) {
      setColumnDefs(
        Object.keys(rowData[0]).map((key) => ({
          field: key,
          headerName: key,
          sortable: true,
          filter: key === 'Timestamp' ? 'agDateColumnFilter' : 'agNumberColumnFilter',
          type: key === 'Timestamp' ? 'rightAligned' : 'numericColumn',
          valueFormatter: key === 'Timestamp' ? undefined : numberFormatter,
        }))
      );
    }
  }, [rowData]);

  const fetchViews = async () => {
    try {
      setLoading(true);
      const response = await api.get<ViewsResponse>('/reporting/v2/views/');
      setViews(response.views);
    } catch (err) {
      setError('Failed to load views');
      console.error('Error fetching views:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMassBalanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedView) {
        throw new Error('No view selected');
      }

      const payload: Record<string, any> = {
        view_name: selectedView.view_name,
      };

      // Only add dates to payload if they are set
      if (startDate) {
        payload.start_datetime = startDate;
      }
      if (endDate) {
        payload.end_datetime = endDate;
      }

      const response = await api.post<MassBalanceResponse>('/reporting/v2/rng-mass-balance/', payload);

      setRowData(response.view_data);
      setViewAggregate(response.view_aggregate);
      setFullPrecisionRowDataCsv(response.full_precision_view_data_csv);
      setChartConfig(response.chart_config as ChartData<"bar", (number | [number, number] | null)[], unknown>);
      setChartTitle(response.chart_title);
      setTaxCredit(response.tax_credit);
    } catch (err) {
      setError('Failed to load mass balance data');
      console.error('Error fetching mass balance data:', err);
      toast.error('Failed to load mass balance data');
    } finally {
      setLoading(false);
      toast.success('Mass balance data loaded successfully');
    }
  };

  // Function to handle CSV export
  const handleDownloadCsv = () => {
    const blob = new Blob([fullPrecisionRowDataCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedView?.view_name}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
          <Loader2 className="animate-spin" size={24} />
          <div className="text-lg font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <span>{chartTitle}</span>
        </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

        <div className="flex gap-6">
          <div className="flex flex-col mt-2 space-y-4 w-1/4">
            <Select
              value={selectedView?.id}
              onValueChange={(value: string) => {
                const view = views.find((view) => view.id === value);
                if (view) {
                  setSelectedView(view);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                {views.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.view_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FloatingLabelInput
              label="Start Date (EST)"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
              max={endDate}
            />

            <FloatingLabelInput
              label="End Date (EST)"
              type="datetime-local"
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />

            <div className="flex justify-center">
              <span>OR</span>
            </div>

            <FloatingLabelInput
              label="Single Day (EST)"
              type="date" 
              className="w-full"
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                // Set to 10 AM EST on selected date in EST
                selectedDate.setHours(26,0,0,0);
                setStartDate(selectedDate.toISOString().slice(0,16));
                
                // Set to 10 AM EST next day
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                setEndDate(nextDay.toISOString().slice(0,16));
              }}
            />

            <button
              onClick={handleDownloadCsv}
              className="button-primary px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
            >
              Download CSV
            </button>
          </div>

          {chartConfig && Object.keys(chartConfig).length > 0 && (
            <div className="w-1/2 h-[300px]">
              <Bar data={chartConfig} options={options} />
            </div>
          )}

          {taxCredit && Object.keys(taxCredit).length > 0 && (
            <div className="w-1/4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-semibold text-base">RINs</h3>
                  <p className="text-xl">{taxCredit.RINs.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-semibold text-base">D-Code</h3>
                  <p className="text-xl">{taxCredit['D-Code']}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base">Prevailing Wage</h3>
                    <a href="https://www.irs.gov/newsroom/treasury-irs-release-guidance-on-the-prevailing-wage-and-apprenticeship-requirements-for-increased-credit-and-deduction-amounts-under-the-inflation-reduction-act" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      <Info size={16} />
                    </a>
                  </div>
                  <button 
                    onClick={() => setShowPrevailingWage(!showPrevailingWage)} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showPrevailingWage ? 'bg-blue-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPrevailingWage ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-semibold text-base mb-1">kg of CO2 / mmBtu</h3>
                  <p className="text-lg">0. kg / mmBtu</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg shadow">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-base">45Z Tax Credit</h3>
                  <a href="https://crsreports.congress.gov/product/pdf/IF/IF12502" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    <Info size={16} />
                  </a>
                </div>
                <div className="space-y-2 text-lg">
                  {showPrevailingWage ? (
                    <p className="text-lg">$ {taxCredit['45Z Credit']['Prevailing Wage'].toLocaleString()}</p>
                  ) : (
                    <p className="text-lg">$ {taxCredit['45Z Credit']['Non-Prevailing Wage'].toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="ag-theme-alpine w-full h-[600px]">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pinnedTopRowData={[viewAggregate]}
          getRowStyle={getRowStyle} // Apply row styles
        />
      </div>
      <ToastContainer />
    </div>
  );
}