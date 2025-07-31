'use client'

import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { Download, Loader2 } from 'lucide-react'
import { api, BASE_URL, defaultHeaders } from '@/lib/api' 
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { TimezoneSelect } from '@/components/ui/timezone-select';
import QueryTable from '@/components/table/QueryTable';
import { ColumnWithType } from '@/components/table/QueryTable';
import { DateTime } from 'luxon';
import SO2Calculator from './so2_calculator';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const getRowStyle = (params: any): { backgroundColor: string; fontWeight: string } | undefined => {
  if (params.node.rowPinned) {
    return { backgroundColor: '#f5f5f5', fontWeight: 'bold' };
  }
  return undefined;
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

interface AirPermitsResponse {
  summary_data: any[];
  aggregated_data: any[];
}

export default function AirPermitsPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [timezone, setTimezone] = useState<string>('US/Eastern')
  const [rowData, setRowData] = useState<any[]>([])
  const [columnDefs, setColumnDefs] = useState<ColumnWithType[]>([])
  const [viewAggregate, setViewAggregate] = useState<any[]>([])
  const [useAverage, setUseAverage] = useState<boolean>(true)
  const [so2Inputs, setSo2Inputs] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState<string>('')

  // Get today's date in YYYY-MM-DD format to restrict future date selection
  const today = DateTime.now().toISODate() ?? ''

  useEffect(() => {
    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      console.log('Site changed to:', site);
      
      // Check if site exists and has a name before updating
      if (site && site.name) {
        console.log('Valid site received, updating selectedSite to:', site.name);
        setSelectedSite(site.name);
      } else {
        console.log('Invalid site received (undefined or no name):', site);
        // Try to get site from localStorage as fallback
        const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
        if (selected_site.name) {
          console.log('Fallback: Using site from localStorage:', selected_site.name);
          setSelectedSite(selected_site.name);
        }
      }
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    
    return () => {
      window.removeEventListener('siteChange', handleSiteChange);
    };
  }, []);

  // Fetch data when view or dates change
  useEffect(() => {
    fetchAirPermitsData();
  }, [startDate, endDate, selectedSite, timezone]);

  // Log selectedSite changes for debugging
  useEffect(() => {
    console.log('selectedSite state changed to:', selectedSite);
  }, [selectedSite]);

  // Initialize selectedSite from localStorage on component mount
  useEffect(() => {
    const selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
    if (selected_site.name) {
      console.log('Initializing selectedSite from localStorage:', selected_site.name);
      setSelectedSite(selected_site.name);
    }
  }, []);

  // set column defs based on rowData
  useEffect(() => {
    if (rowData && rowData.length > 0) {
      setColumnDefs(
        Object.keys(rowData[0]).map((key) => {
          const sampleValue = rowData[0][key];
          let valueFormatter = undefined;
          let type: 'string' | 'number' | 'boolean' | 'date' = 'string';
          
          if (key === 'Day' || key.includes('manual_check')) {
            // No formatter for Day column or manual check columns
            valueFormatter = undefined;
          } else if (typeof sampleValue === 'number') {
            // Number formatter for numeric values
            valueFormatter = numberFormatter;
            type = 'number';
          } else if (sampleValue instanceof Date) {
            type = 'date';
          } else if (typeof sampleValue === 'boolean') {
            type = 'boolean';
          }
          
          return {
            field: key,
            headerName: key,
            sortable: true,
            valueFormatter,
            type,
          } as ColumnWithType;
        })
      );
    }
  }, [rowData]);

  // Convert rowData to dataFrame format when it changes
  useEffect(() => {
    if (rowData.length > 0) {
      const newDataFrame: any = {};
      Object.keys(rowData[0]).forEach(key => {
        newDataFrame[key] = rowData.map(row => row[key]);
      });
      // setDataFrame(newDataFrame); // This line is removed as per the edit hint
    }
  }, [rowData]);

  const fetchAirPermitsData = async () => {
    try {
      setLoading(true);

      const payload: Record<string, any> = {
        timezone: timezone // Add timezone to payload
      };
      // Only add dates to payload if they are set
      if (startDate) {
        payload.start_date = startDate;
      }
      if (endDate) {
        payload.end_date = endDate;
      }
      
      // Use selectedSite state first, fallback to localStorage if needed
      let site_name = selectedSite;
      if (!site_name) {
        var selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
        site_name = selected_site.name;
      }
      
      console.log('Site name being used in fetchAirPermitsData:', site_name);
      console.log('selectedSite state value in fetchAirPermitsData:', selectedSite);
      
      // Only proceed if we have a valid site name
      if (!site_name) {
        console.log('No site name available, skipping fetch');
        return;
      }
      
      payload.site_name = site_name;

      const response = await api.post<AirPermitsResponse>(`/reporting/v2/air-permits/`, payload);
      
      // Convert boolean values to strings to prevent checkbox rendering
      const processedSummaryData = response.summary_data.map(row => {
        const processedRow = { ...row };
        Object.keys(processedRow).forEach(key => {
          if (typeof processedRow[key] === 'boolean') {
            processedRow[key] = processedRow[key] ? 'true' : 'false';
          }
        });
        return processedRow;
      });
      
      setRowData(processedSummaryData);
      setViewAggregate(response.aggregated_data);
      let aggegratedList = response.aggregated_data ? Object.entries(response.aggregated_data).map(([label, value]) => ({ label, value: Number(value) })) : []
      setSo2Inputs(aggegratedList)
    } catch (error) {
      console.error('Error fetching air permits data:', error); 
      toast.error('Failed to fetch air permits data. Please try again.')
    } finally {
      setLoading(false);
    }
  }
  
  const downloadReport = async () => {
    try {
      setLoading(true);

      const payload: Record<string, any> = {
        use_average: useAverage,
        timezone: timezone // Add timezone to payload
      };

      // Only add dates to payload if they are set
      if (startDate) {
        payload.start_date = startDate;
      }
      if (endDate) {
        payload.end_date = endDate;
      }
      
      // Use selectedSite state first, fallback to localStorage if needed
      let site_name = selectedSite;
      if (!site_name) {
        var selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
        site_name = selected_site.name;
      }
      
      if (!site_name) {
        toast.error('No site selected. Please select a site first.');
        return;
      }
      
      payload.site_name = site_name;

      const response = await fetch(`${BASE_URL}/reporting/v2/air-permits/download/`, {
        method: 'POST',
        headers: {...defaultHeaders},
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Export failed');

      // Create download link and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Air-Permits-Report-${useAverage ? 'Average' : 'Sum'}-${site_name}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Report downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download report. Please try again.')
    } finally {
      setLoading(false);
    }
  }

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
    <div className="mx-auto space-y-3">
      <div className="text-2xl font-bold">Air Permits</div>
      
      {/* Controls and Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Date Selection Controls */}
        <Card className="p-4 shadow-sm">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Date Range Selection</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Timezone:</span>
                <TimezoneSelect
                  value={timezone}
                  onValueChange={setTimezone}
                  className="w-48"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <Tabs defaultValue="range" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="range">Date Range</TabsTrigger>
                <TabsTrigger value="gas">Gas Day</TabsTrigger>
                <TabsTrigger value="preset">Presets</TabsTrigger>
              </TabsList>
              
              <TabsContent value="range" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                    max={endDate || today}
                  />
                  <FloatingLabelInput
                    label="End Date"
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                    max={today}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="gas" className="mt-0">
                <FloatingLabelInput
                  label="Select Gas Day"
                  type="date" 
                  className="w-full"
                  max={today}
                  onChange={(e) => {
                    const selectedDate = DateTime.fromISO(e.target.value);
                    const nextDay = selectedDate.plus({ days: 1 });
                    setStartDate(selectedDate.toISODate() ?? '');
                    setEndDate(nextDay.toISODate() ?? '');
                  }}
                />
              </TabsContent>
              
              <TabsContent value="preset" className="mt-0">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '1 Day', unit: 'day', value: 1 },
                    { label: '3 Days', unit: 'day', value: 3 },
                    { label: '7 Days', unit: 'day', value: 7 },
                    { label: '2 Weeks', unit: 'week', value: 2 },
                    { label: '1 Month', unit: 'month', value: 1 },
                    { label: '3 Months', unit: 'month', value: 3 },
                  ].map(({ label, unit, value }) => (
                    <Button
                      key={`${unit}-${value}`}
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const now = DateTime.now();
                        const start = now.minus({ [unit + 's']: value });
                        setStartDate(start.toISODate() ?? '');
                        setEndDate(now.toISODate() ?? '');
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="px-0 pt-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-sm">Report Type:</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm">{useAverage ? 'Average' : 'Sum'}</span>
                <Switch
                  checked={useAverage}
                  onCheckedChange={setUseAverage}
                />
              </div>
            </div>
            <Button onClick={downloadReport} className="flex items-center gap-2">
              <Download size={18} />
              <span>Download Report</span>
            </Button>
          </CardFooter>
        </Card>
        
        {/* SO2 Calculator */}
        <SO2Calculator inputs={so2Inputs} startDateTime={startDate} endDateTime={endDate} siteName={selectedSite} />
      </div>

      {/* Data Table */}
      <div className="w-full h-[800px] mt-6">
        <QueryTable
          initialRowData={rowData}
          initialColumnDefs={columnDefs}
          pinnedTopRowData={[viewAggregate]}
          getRowStyle={getRowStyle}
        />
      </div>
      <ToastContainer />
    </div>
  )
}
