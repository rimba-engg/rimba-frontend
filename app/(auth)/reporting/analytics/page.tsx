'use client';

import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { api, defaultHeaders ,BASE_URL} from '@/lib/api';
import { TimezoneSelect } from '@/components/ui/timezone-select';

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
import CustomColumnAdder from '@/components/table/CustomColumnAdder';
import type { Column, DataFrameType } from '@/components/table/CustomColumnAdder';

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

interface DataSummary {
    labels: string[];
    values: number[];
    site_type: string;
    site_name: string;
    multi_site_data?: { [key: string]: number[] };
}

interface AnalyticsResponse {
    data_summary: DataSummary | null;
    table_data: any;
    totals: any;
}

const getRowStyle = (params: any): { backgroundColor: string; fontWeight: string } | undefined => {
  if (params.node.rowPinned) {
    return { backgroundColor: '#f5f5f5', fontWeight: 'bold' };
  }
  return undefined;
};

// Function to create chart config for analytics data
function createAnalyticsChartConfig(dataSummary: DataSummary): any {
  const siteConfigs = {
    'novilla': {
      'West Branch': {
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      'Red Leaf': {
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
      'Three Petals': {
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
      'Buckhorn': {
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
      },
    },
    'demo_rng': {
      'Green Flame Bio Energy': {
        backgroundColor: 'rgba(34, 139, 34, 0.2)',
        borderColor: 'rgba(34, 139, 34, 1)',
      },
      'Eco Methane Hub': {
        backgroundColor: 'rgba(255, 140, 0, 0.2)',
        borderColor: 'rgba(255, 140, 0, 1)',
      },
    },
  };

  if (dataSummary.site_type === 'novilla' || dataSummary.site_type === 'demo_rng') {
    let colors = { backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)' };
    
    if (dataSummary.site_type === 'novilla') {
      colors = siteConfigs.novilla[dataSummary.site_name as keyof typeof siteConfigs.novilla] || colors;
    } else if (dataSummary.site_type === 'demo_rng') {
      colors = siteConfigs.demo_rng[dataSummary.site_name as keyof typeof siteConfigs.demo_rng] || colors;
    }

    return {
      labels: dataSummary.labels,
      datasets: [{
        label: `${dataSummary.site_name} Balance`,
        data: dataSummary.values,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        fill: false,
        tension: 0.1
      }]
    };
  }

  return null;
}

// Function to create chart config for manure flow multi-site data
function createManureFlowChartConfig(dataSummary: DataSummary): any {
  if (dataSummary.site_type !== 'manure_flow' || !dataSummary.multi_site_data) {
    return null;
  }

  const siteColors = {
    'Hoogland': { backgroundColor: 'rgba(65, 105, 225, 0.2)', borderColor: 'rgba(65, 105, 225, 1)' },
    'Maassen': { backgroundColor: 'rgba(255, 165, 0, 0.2)', borderColor: 'rgba(255, 165, 0, 1)' },
    'Buckhorn': { backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)' },
    'Three Petals': { backgroundColor: 'rgba(153, 102, 255, 0.2)', borderColor: 'rgba(153, 102, 255, 1)' },
    'Red Leaf': { backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)' },
    'BH-historian': { backgroundColor: 'rgba(65, 105, 225, 0.2)', borderColor: 'rgba(65, 105, 225, 1)' }
  };

  const datasets = Object.entries(dataSummary.multi_site_data).map(([siteName, data]) => ({
    label: siteName,
    data: data,
    backgroundColor: siteColors[siteName as keyof typeof siteColors]?.backgroundColor || 'rgba(75, 192, 192, 0.2)',
    borderColor: siteColors[siteName as keyof typeof siteColors]?.borderColor || 'rgba(75, 192, 192, 1)',
    borderWidth: 1,
    fill: false,
    tension: 0.1
  }));

  return {
    labels: dataSummary.labels,
    datasets: datasets
  };
}

export default function AnalyticsPage() {
    const [chartConfig, setChartConfig] = useState<any>(null);
    const [chartConfigManureData, setChartConfigManureData] = useState<any>(null);
    const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
    const [manureDataSummary, setManureDataSummary] = useState<DataSummary | null>(null);
    const [timezone, setTimezone] = useState<string>('US/Eastern');
  
    const [loading, setLoading] = useState(true);
    const [loadingManureData, setLoadingManureData] = useState(true);

    const [startDate, setStartDate] = useState<string>(DateTime.now().setZone('America/New_York').minus({ weeks: 1 }).toISO()?.slice(0, 10) ?? '');
    const [endDate, setEndDate] = useState<string>(DateTime.now().setZone('America/New_York').toISO()?.slice(0, 10) ?? '');
    const [rowData, setRowData] = useState<any>([]);
    const [totals, setTotals] = useState<any>(null);
    const [columnDefs, setColumnDefs] = useState<any>([]);
    const [dataFrame, setDataFrame] = useState<DataFrameType>({});
    const [relative, setRelative] = useState('Select time range...');
    const [selectedSite, setSelectedSite] = useState<string>('');
    const [isDownloading, setIsDownloading] = useState(false);
    
    useEffect(() => {
        fetchAnalytics();
        fetchAnalyticsManureData();
    }, [startDate, endDate, selectedSite, timezone]);

    // Add this new function to handle new column addition
    const handleColumnAdded = (newData: DataFrameType, newColumn: Column) => {
        // Update the dataframe with new data
        setDataFrame(newData);
        
        // Convert the new data to row format
        const newRowData = Object.keys(newData[Object.keys(newData)[0]]).map((index) => {
            const row: Record<string, number | string> = {};
            Object.keys(newData).forEach((key) => {
                row[key] = newData[key][parseInt(index)];
            });
            return row;
        });
        
        // Update row data
        setRowData(newRowData);
        
        // Add the new column definition
        setColumnDefs([...columnDefs, {
            headerName: newColumn.label,
            field: newColumn.key
        }]);
    };

    // Create chart config when data_summary changes
    useEffect(() => {
        if (dataSummary) {
            const chartConfig = createAnalyticsChartConfig(dataSummary);
            setChartConfig(chartConfig);
        } else {
            setChartConfig(null);
        }
    }, [dataSummary]);

    // Create manure flow chart config when manure_data_summary changes
    useEffect(() => {
        if (manureDataSummary) {
            const chartConfig = createManureFlowChartConfig(manureDataSummary);
            setChartConfigManureData(chartConfig);
        } else {
            setChartConfigManureData(null);
        }
    }, [manureDataSummary]);

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
            site_name: site_name,
            timezone: timezone
        })
            .then(data => {
                setDataSummary(data.data_summary);
                setRowData(data.table_data);
                setTotals(data.totals);
                
                // Convert row data to dataframe format
                const newDataFrame: DataFrameType = {};
                if (data.table_data.length > 0) {
                    Object.keys(data.table_data[0]).forEach(key => {
                        newDataFrame[key] = data.table_data.map((row: Record<string, number | string>) => row[key]);
                    });
                    setDataFrame(newDataFrame);
                }
                
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
          site_name: site_name,
          timezone: timezone
      })
          .then(data => {
              setManureDataSummary(data.data_summary);
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
            site_name: JSON.parse(localStorage.getItem('selected_site') || '{}').name,
            timezone: timezone
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
            <div className="relative">
              <TimezoneSelect 
                value={timezone}
                onValueChange={setTimezone}
                className="w-full h-[42px] px-3 py-2 rounded-md border border-input"
              />
              <span className="absolute text-xs font-medium text-gray-700 bg-white px-1 -top-2 left-2">
                Timezone
              </span>
            </div>
            
            <div className="flex flex-row gap-4">
              <FloatingLabelInput
                label="Start Day"
                type="date" 
                className="w-full"
                max={DateTime.now().setZone(timezone).toISO()?.slice(0, 10) ?? ''}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <FloatingLabelInput
                label="End Day"
                type="date"
                className="w-full"
                min={startDate}
                max={DateTime.now().setZone(timezone).toISO()?.slice(0, 10) ?? ''}
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
        
        <div className="flex justify-end mb-4">
            <CustomColumnAdder
                dataFrame={dataFrame}
                onColumnAdded={handleColumnAdded}
                buttonVariant="outline"
                buttonText="Add Custom Column"
                className="bg-primary text-white hover:bg-primary/90"
            />
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
