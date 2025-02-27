'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
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

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy"});

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ViewsResponse {
  views: GasBalanceView[];
}

interface MassBalanceResponse {
  view_aggregate: Record<string, any>;
  view_data: Array<Record<string, any>>;
  chart_config: Record<string, any>;
  chart_title: string;
}

const defaultColDef = {
  flex: 1,
  minWidth: 160,
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

export default function RngMassBalancePage() {
  const [views, setViews] = useState<GasBalanceView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnDefs, setColumnDefs] = useState<Record<string, any>[]>([]);
  const [rowData, setRowData] = useState<Array<Record<string, any>>>([]);
  const [selectedView, setSelectedView] = useState<GasBalanceView | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewAggregate, setViewAggregate] = useState<Record<string, any>>({});
  const [chartConfig, setChartConfig] = useState<ChartData<"bar", (number | [number, number] | null)[], unknown> | null>(null);
  const [chartTitle, setChartTitle] = useState<string>('');

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
        payload.start_datetime = new Date(startDate).toISOString();
      }
      if (endDate) {
        payload.end_datetime = new Date(endDate).toISOString();
      }

      const response = await api.post<MassBalanceResponse>('/reporting/v2/rng-mass-balance/', payload);
      console.log(response);

      setRowData(response.view_data);
      setViewAggregate(response.view_aggregate);
      setChartConfig(response.chart_config as ChartData<"bar", (number | [number, number] | null)[], unknown>);
      setChartTitle(response.chart_title);
    } catch (err) {
      setError('Failed to load mass balance data');
      console.error('Error fetching mass balance data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !rowData.length || chartConfig === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-regular">{chartTitle}</span>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedView?.id}
            onValueChange={(value: string) => {
              const view = views.find((view) => view.id === value);
              if (view) {
                setSelectedView(view);
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
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

          <div className="flex items-center gap-2">
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {chartConfig !== null && (
        <div className="w-1/2 h-[300px]">
          <Bar data={chartConfig} options={options} />
        </div>
      )}

      {/* AG Grid Table */}
      <div className="ag-theme-alpine w-full h-[600px]">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pinnedTopRowData={[viewAggregate]}
          getRowStyle={getRowStyle} // Apply row styles
        />
      </div>
    </div>
  );
}