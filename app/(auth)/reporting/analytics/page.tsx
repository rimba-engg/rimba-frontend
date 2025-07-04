'use client';

import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { api, defaultHeaders ,BASE_URL} from '@/lib/api';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DateTime } from 'luxon';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import QueryTable from '@/components/table/QueryTable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

interface AnalyticsResponse {
    chart_config: any;
    table_data: any;
    totals: any;
}

const getRowStyle = (params: any): { backgroundColor: string; fontWeight: string } | undefined => {
  if (params.node.rowPinned) {
    return { backgroundColor: '#f5f5f5', fontWeight: 'bold' };
  }
  return undefined;
};

export default function AnalyticsPage() {
    const [chartConfig, setChartConfig] = useState<any>(null);
    const [chartConfigManureData, setChartConfigManureData] = useState<any>(null);
  
    const [loading, setLoading] = useState(true);
    const [loadingManureData, setLoadingManureData] = useState(true);

    const [startDate, setStartDate] = useState<string>(DateTime.now().setZone('America/New_York').minus({ weeks: 1 }).toISO()?.slice(0, 10) ?? '');
    const [endDate, setEndDate] = useState<string>(DateTime.now().setZone('America/New_York').toISO()?.slice(0, 10) ?? '');
    const [rowData, setRowData] = useState<any>([]);
    const [totals, setTotals] = useState<any>(null);
    const [columnDefs, setColumnDefs] = useState<any>([]);
    const [relative, setRelative] = useState('Select time range...');
    const [selectedSite, setSelectedSite] = useState<string>('');
    const [isDownloading, setIsDownloading] = useState(false);
    
    useEffect(() => {
        fetchAnalytics();
        fetchAnalyticsManureData();
    }, [startDate, endDate, selectedSite]);

    useEffect(() => {
      const handleSiteChange = (event: any) => {
        const { site } = event.detail;
        console.log('Site changed to:', site.name);
        // Do something with the new site
        setSelectedSite(site.name);
      };
      
      window.addEventListener('siteChange', handleSiteChange);
      
      return () => {
        window.removeEventListener('siteChange', handleSiteChange);
      };
    }, []);

    const fetchAnalytics = () => {
        setLoading(true);
        var selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
        var site_name = selected_site.name;
        api.post<AnalyticsResponse>('/reporting/v2/rng/analytics/', {
            start_date: startDate,
            end_date: endDate,
            site_name: site_name
        })
            .then(data => {
                setChartConfig(data.chart_config);
                setRowData(data.table_data);
                setTotals(data.totals);
                // set column defs
                setColumnDefs(Object.keys(data.table_data[0]).map((key: any) => {
                    return {
                        headerName: key,
                        field: key
                    }
                }));
            })
            .catch(error => {
                console.error('Error fetching analytics data:', error);
                toast.error('Error fetching analytics data');
            })
            .finally(() => setLoading(false));
    };

    const fetchAnalyticsManureData = () => {
      setLoadingManureData(true);
      var selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
      var site_name = selected_site.name;
      api.post<AnalyticsResponse>('/reporting/v2/rng/analytics/manure-flow/', {
          start_date: startDate,
          end_date: endDate,
          site_name: site_name
      })
          .then(data => {
              setChartConfigManureData(data.chart_config);
          })
          .catch(error => {
              console.error('Error fetching manure flow data:', error);
              toast.error('Error fetching manure flow data');
          })
          .finally(() => setLoadingManureData(false));
  };

    // Add a button to download analytic volume data
    const downloadAnalyticsVolume = async () => {
      try {
        setIsDownloading(true);
        const response = await fetch(`${BASE_URL}/reporting/v2/rng/analytics/manure-flow/download/`, {
          method: 'POST',
          headers: {
            ...defaultHeaders
          },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
            site_name: JSON.parse(localStorage.getItem('selected_site') || '{}').name
          })
        });

        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manure_analytics_volume.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading analytics volume:', error);
        toast.error('Error downloading analytics volume');
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <div className='space-y-4'>
        <div className="flex justify-between items-center">
          <div className='text-2xl font-bold'>Analytics</div>
            <button
              onClick={downloadAnalyticsVolume}
              className="flex gap-2 items-center px-2 py-1 bg-[#00674b] text-white rounded hover:bg-green-700 text-sm"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                'Download Manure Volume Data'
              )}
            </button>
          </div>

        <div className="flex gap-4">
          <div className="flex flex-col py-4 gap-4 w-1/4">
            <div className="flex flex-row gap-4">
              <FloatingLabelInput
                label="Start Day (EST)"
                type="date" 
                className="w-full"
                max={endDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <FloatingLabelInput
                label="End Day (EST)"
                type="date"
                className="w-full"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>OR</div>

            <div>
              <select 
                className="px-4 py-2 border rounded"
                onChange={(e) => {
                  const [unit, amount] = e.target.value.split('-');
                  setRelative(`Last ${amount} ${unit}`);
                  const now = DateTime.now().setZone('America/New_York');
                  let start;
                  let end = now;

                  switch(unit) {
                    case 'day':
                      start = now.minus({ days: parseInt(amount) });
                      break;
                    case 'week':
                      start = now.minus({ weeks: parseInt(amount) });
                      break;
                    case 'month':
                      start = now.minus({ months: parseInt(amount) });
                      break;
                  }

                  setStartDate(start?.toISO()?.slice(0, 10) ?? '');
                  setEndDate(end?.toISO()?.slice(0, 10) ?? '');
                }}
              >
                <option value="">{relative}</option>
                <optgroup label="Days">
                  {[1,2,3,4,5,6].map(n => (
                    <option key={`day-${n}`} value={`day-${n}`}>Last {n} day{n > 1 ? 's' : ''}</option>
                  ))}
                </optgroup>
                <optgroup label="Weeks">
                  {[1,2,3,4].map(n => (
                    <option key={`week-${n}`} value={`week-${n}`}>Last {n} week{n > 1 ? 's' : ''}</option>
                  ))}
                </optgroup>
                <optgroup label="Months">
                  {[1,2,3].map(n => (
                    <option key={`month-${n}`} value={`month-${n}`}>Last {n} month{n > 1 ? 's' : ''}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="w-3/4 h-[300px]">
            {loading ? (
              <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
                <Loader2 className="animate-spin" size={24} />
                <div className="text-lg font-medium">Loading analytics data...</div>
              </div>
            ) : chartConfig ? (
              <Line options={options} data={chartConfig} />
            ) : (
              <div className="flex items-center justify-center h-full bg-white p-8 rounded-lg shadow-lg">
                <div className="text-lg font-medium text-gray-500">No data available</div>
              </div>
            )}
            <ToastContainer />
          </div>
          <div className="w-3/4 h-[300px]">
            {loadingManureData ? (
              <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
                <Loader2 className="animate-spin" size={24} />
                <div className="text-lg font-medium">Loading manure flow data...</div>
              </div>
            ) : chartConfigManureData ? (
              <Line options={options} data={chartConfigManureData} />
            ) : (
              <div className="flex items-center justify-center h-full bg-white p-8 rounded-lg shadow-lg">
                <div className="text-lg font-medium text-gray-500">No manure flow data available</div>
              </div>
            )}
            <ToastContainer />
          </div>
        </div>
        
        <QueryTable
          initialRowData={rowData}
          initialColumnDefs={columnDefs}
          pinnedTopRowData={[totals]}
          getRowStyle={getRowStyle}
          autoSizeStrategy={{
            type: "fitCellContents",
          }}
        />
      </div>
    );
}
