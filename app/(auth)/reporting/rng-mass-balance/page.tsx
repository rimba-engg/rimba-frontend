'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DateTime } from 'luxon';
import { type GasBalanceView } from './types';
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
import QueryTable from '@/components/table/QueryTable';
import { ColumnWithType } from '@/components/table/QueryTable';
// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ViewsResponse {
  views: GasBalanceView[];
}

interface DataSummary {
  labels: string[];
  values: number[];
  site_type: string;
  site_name: string;
}

interface MassBalanceResponse {
  view_aggregate: Record<string, any>;
  view_data: Array<Record<string, any>>;
  data_summary: DataSummary | null;
  chart_title: string;
  tax_credit: Record<string, any>;
}

interface CsvExportResponse {
  csv_data?: string;
  data?: string;
  full_precision_view_data_csv?: string;
  csv?: string;
}

// Define the row style based on whether the row is pinned
const getRowStyle = (params: any): { backgroundColor: string; fontWeight: string } | undefined => {
  if (params.node.rowPinned) {
    return { backgroundColor: '#f5f5f5', fontWeight: 'bold' };
  }
  if (params.data.IsSubstituted) {
    return { backgroundColor: 'rgba(242, 255, 0, 0.2)', fontWeight: 'bold' };
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
    minimumFractionDigits: params.colDef.field.includes('%') ? 1 : 2,
    maximumFractionDigits: params.colDef.field.includes('%') ? 1 : 2
  }).format(params.value);
}

// Function to convert data_summary to chart config
function createChartConfig(dataSummary: DataSummary): ChartData<"bar", number[], unknown> {
  let colors = { backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)' };

  return {
    labels: dataSummary.labels,
    datasets: [{
      label: 'Total MMBTU',
      data: dataSummary.values,
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: 1
    }]
  };
}

export default function RngMassBalancePage() {
  const [views, setViews] = useState<GasBalanceView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>([]);
  const [rowData, setRowData] = useState<Array<Record<string, any>>>([]);
  const [selectedView, setSelectedView] = useState<GasBalanceView | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewAggregate, setViewAggregate] = useState<Record<string, any>>({});
  const [chartConfig, setChartConfig] = useState<ChartData<"bar", (number | [number, number] | null)[], unknown> | null>(null);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [chartTitle, setChartTitle] = useState<string>('');
  const [taxCredit, setTaxCredit] = useState<Record<string, any>>({});
  const [showPrevailingWage, setShowPrevailingWage] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [csvLoading, setCsvLoading] = useState(false);

  // Set default dates (last 3 days to today) when component mounts
  useEffect(() => {
    // Set default dates
    if (!startDate && !endDate) {
      const now = DateTime.now().setZone('America/New_York').set({ hour: 10, minute: 0, second: 0, millisecond: 0 });
      const threeDaysAgo = now.minus({ days: 3 }).set({ hour: 10, minute: 0, second: 0, millisecond: 0 });
      
      setStartDate(threeDaysAgo.toISO()?.slice(0, 16) ?? '');
      setEndDate(now.toISO()?.slice(0, 16) ?? '');
    }

    // Initialize selected site from localStorage
    const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
    if (selected_site && selected_site.name) {
      setSelectedSite(selected_site.name);
    }
  }, []);

  useEffect(() => {
    if (selectedSite) {  // Only fetch views if we have a valid site
      fetchViews();
    }
  }, [selectedSite]);

  // Fetch data when view changes
  useEffect(() => {
    if (selectedView && selectedSite) {  // Only fetch if both view and site are available
      fetchMassBalanceData();
    }
  }, [selectedView, selectedSite]);

  // set column defs based on rowData
  useEffect(() => {
    if (rowData && rowData.length > 0) {
      setColumnDefs(
        Object.keys(rowData[0]).map((key) => ({
          field: key,
          headerName: key,
          sortable: true,
          filter: key === 'Timestamp' ? 'agDateColumnFilter' : 'agNumberColumnFilter',
          type: key === 'Timestamp' ? 'date' : 'number',
          valueFormatter: key === 'Timestamp' ? undefined : numberFormatter,
        })) as ColumnWithType[]
      );
    }
  }, [rowData]);

  // Create chart config when data_summary changes
  useEffect(() => {
    if (dataSummary) {
      const chartConfig = createChartConfig(dataSummary);
      setChartConfig(chartConfig);
    } else {
      setChartConfig(null);
    }
  }, [dataSummary]);

  const fetchViews = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedSite) {
        throw new Error('No site selected');
      }

      const response = await api.get<ViewsResponse>(`/reporting/v2/views/?site_name=${selectedSite}`);
      const filteredViews = response.views.filter(view => view.view_name !== 'Raw Data');
      
      if (filteredViews.length === 0) {
        throw new Error('No views available for this site');
      }

      setViews(filteredViews);
      setSelectedView(filteredViews[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load views');
      console.error('Error fetching views:', err);
      setSelectedView(null);
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

      if (!selectedSite) {
        throw new Error('No site selected');
      }

      const payload: Record<string, any> = {
        view_name: selectedView.view_name,
        site_name: selectedSite
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
      setDataSummary(response.data_summary);
      setChartTitle(response.chart_title);
      setTaxCredit(response.tax_credit);
    } catch (err) {
      setError('Failed to load mass balance data');
      console.error('Error fetching mass balance data:', err);
      toast.error('Failed to load mass balance data');
    } finally {
      setLoading(false);
      toast.success('Mass balance data loaded successfully', {position: 'bottom-right'});
    }
  };

  // Handle site changes from other components
  useEffect(() => {
    const handleSiteChange = () => {
      try {
        // Get site data from localStorage
        const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
        if (!selected_site || !selected_site.name) {
          throw new Error('No site selected');
        }

        console.log('Site changed to:', selected_site.name);
        
        // Reset states
        setError(null);
        setViews([]);
        setSelectedView(null);
        setRowData([]);
        setViewAggregate({});
        setChartConfig(null);
        setDataSummary(null);
        setChartTitle('');
        setTaxCredit({});
        
        // Update site and trigger loading
        setLoading(true);
        setSelectedSite(selected_site.name);
      } catch (err) {
        console.error('Error handling site change:', err);
        setError('Failed to change site. Please try again.');
        setLoading(false);
      }
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    return () => {
      window.removeEventListener('siteChange', handleSiteChange);
    };
  }, []);

  // Function to handle CSV export with different API
  const handleDownloadCsv = async () => {
    try {
      setCsvLoading(true);
      
      if (!selectedView) {
        toast.error('No view selected');
        return;
      }

      if (!selectedSite) {
        toast.error('No site selected');
        return;
      }

      const payload: Record<string, any> = {
        view_name: selectedView.view_name,
        site_name: selectedSite
      };

      // Only add dates to payload if they are set
      if (startDate) {
        payload.start_datetime = startDate;
      }
      if (endDate) {
        payload.end_datetime = endDate;
      }

      // Call the different API endpoint for CSV export
      const response = await api.post<CsvExportResponse | string>('/reporting/v2/rng-mass-balance/download/', payload);
      
      // Handle the response - assuming it returns CSV data
      let csvData = '';
      if (typeof response === 'string') {
        csvData = response;
      } else if (response && typeof response === 'object') {
        const responseObj = response as CsvExportResponse;
        csvData = responseObj.csv_data || responseObj.data || responseObj.full_precision_view_data_csv || responseObj.csv || '';
      }

      if (!csvData) {
        toast.error('No CSV data received from server');
        return;
      }

      // Create and download the CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
      const site_name = selected_site.name;
      const filename = `${selectedView?.view_name}_${site_name}_${startDate}_${endDate}.csv`;
      
      a.download = filename;
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success('CSV downloaded successfully', { position: 'bottom-right' });
    } catch (err) {
      console.error('Error downloading CSV:', err);
      toast.error('Failed to download CSV');
    } finally {
      setCsvLoading(false);
    }
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

  console.log(chartConfig);

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
                // Set to 10 AM EST on selected date in EST
                let selectedDate = DateTime.fromISO(e.target.value + 'T00:00:00', { zone: 'America/New_York' }).set({ hour: 10 });

                // Set to 10 AM EST next day
                let nextDay = selectedDate.plus({ days: 1 });

                // for debugging
                console.log(e.target.value);
                console.log(selectedDate.toISO());
                console.log(nextDay.toISO());

                // set start and end dates
                setStartDate(selectedDate.toISO()?.slice(0, 16) ?? '');
                setEndDate(nextDay.toISO()?.slice(0, 16) ?? '');
              }}
            />

            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={fetchMassBalanceData}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 "
              >
                Search
              </button>
              <button
                onClick={handleDownloadCsv}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                disabled={csvLoading}
              >
                {csvLoading ? <Loader2 className="animate-spin" size={20} /> : 'Download CSV'}
              </button>
            </div>
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

      <QueryTable
        initialRowData={rowData}
        initialColumnDefs={columnDefs}
        pinnedTopRowData={[viewAggregate]}
        getRowStyle={getRowStyle}
        autoSizeStrategy={{
          type: "fitCellContents",
        }}
      />
      <ToastContainer />
    </div>
  );
}