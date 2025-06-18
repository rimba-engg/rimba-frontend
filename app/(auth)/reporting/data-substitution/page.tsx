'use client';

import { useState, useEffect } from 'react';
import { api, BASE_URL, defaultHeaders } from '@/lib/api';
import { DateTime } from 'luxon';
import { type GasBalanceView } from '../rng-mass-balance/types';
import { getStoredCustomer } from '@/lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToastContainer, toast } from 'react-toastify';
import { Loader2, ClockIcon, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface SensorMissingData {
  sensor: string;
  '%missing': number;
}

interface MissingDataSummary {
  date_range?: string;
  missing_sensors_data?: SensorMissingData[];
  unique_sensor_count?: number;
}

interface ValidationResponse {
  status: string;
  message: string;
  data: {
    site: string;
    view: string;
    missing_data_summary: MissingDataSummary;
  };
}

interface MissingDataEntry {
  start_datetime: string;
  end_datetime: string;
  sensor_name: string;
  missing_duration: string;
}

interface SubstitutedDataEntry {
  start_datetime: string;
  end_datetime: string;
  sensor_name: string;
  substituted_duration: string;
  substitution_method: string;
}

// Dummy data for Demo-RNG
const DEMO_MISSING_DATA: MissingDataEntry[] = [
  {
    start_datetime: '2025-04-20T10:00:00',
    end_datetime: '2025-04-20T11:30:00',
    sensor_name: 'Flow Meter',
    missing_duration: '1.5 hours'
  },
  {
    start_datetime: '2025-04-20T12:00:00',
    end_datetime: '2025-04-20T14:00:00',
    sensor_name: 'Pressure Sensor',
    missing_duration: '2 hours'
  },
  {
    start_datetime: '2025-04-20T15:00:00',
    end_datetime: '2025-04-20T16:45:00',
    sensor_name: 'Flare Sensor',
    missing_duration: '1.75 hours'
  }
];

const DEMO_SUBSTITUTED_DATA: SubstitutedDataEntry[] = [
  {
    start_datetime: '2025-04-20T10:00:00',
    end_datetime: '2025-04-20T11:30:00',
    sensor_name: 'Flow Meter',
    substituted_duration: '1.5 hours',
    substitution_method: 'Linear Interpolation'
  },
  {
    start_datetime: '2025-04-20T12:00:00',
    end_datetime: '2025-04-20T14:00:00',
    sensor_name: 'Pressure Sensor',
    substituted_duration: '2 hours',
    substitution_method: 'Last Known Value'
  },
  {
    start_datetime: '2025-04-20T15:00:00',
    end_datetime: '2025-04-20T16:45:00',
    sensor_name: 'Flare Sensor',
    substituted_duration: '1.75 hours',
    substitution_method: 'Average Value'
  }
];

export default function DataSubstitutionPage() {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [validationData, setValidationData] = useState<ValidationResponse['data'] | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Dummy values for demonstration
  const totalSubstitutedMMBTU = 287.5;
  const costPerMMBTU = 5.00;
  const costOfSubstitutedGas = totalSubstitutedMMBTU * costPerMMBTU;

  useEffect(() => {
    // Check if current customer is Demo-RNG
    const customerData = getStoredCustomer();
    const isCustomerDemo = customerData?.name === 'Demo-RNG';
    setIsDemo(isCustomerDemo);
    console.log('Is Demo Customer:', isCustomerDemo);

    if (isCustomerDemo) {
      console.log('Setting demo validation data');
      setValidationData({
        site: 'GreenFlame BioEnergy',
        view: 'Demo View',
        missing_data_summary: {
          date_range: 'April 20, 2025 - April 21, 2025',
          missing_sensors_data: DEMO_MISSING_DATA.map(item => ({
            sensor: item.sensor_name,
            '%missing': 15
          })),
          unique_sensor_count: DEMO_MISSING_DATA.length
        }
      });
    }

    // Listen for site change events
    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      console.log('Site changed to:', site.name);
      
      if (!isCustomerDemo) {
        setLoading(true);
        setValidationData(null);
      }
      setSelectedSite(site.name);
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    return () => window.removeEventListener('siteChange', handleSiteChange);
  }, []);

  useEffect(() => {
    if (!validationData && !isDemo && (selectedSite || localStorage.getItem('selected_site'))) {
      validateTimeSeries();
    }
  }, [selectedSite, isDemo]);

  const validateTimeSeries = async () => {
    // Skip API call for Demo-RNG
    if (isDemo) {
      console.log('Demo mode - setting demo validation data');
      setValidationData({
        site: 'GreenFlame BioEnergy',
        view: 'Demo View',
        missing_data_summary: {
          date_range: 'April 20, 2025 - April 21, 2025',
          missing_sensors_data: DEMO_MISSING_DATA.map(item => ({
            sensor: item.sensor_name,
            '%missing': 15
          })),
          unique_sensor_count: DEMO_MISSING_DATA.length
        }
      });
      return;
    }

    try {
      setValidating(true);
      setError(null);
      setValidationData(null);

      const siteName = selectedSite || JSON.parse(localStorage.getItem('selected_site') || '{}').name;
      if (!siteName) {
        throw new Error('No site selected');
      }

      const payload = {
        site_name: siteName
      };

      const response = await api.post<ValidationResponse>('/reporting/v2/time-series/missing-data-validation/', payload);
      console.log('API Response:', response);
      
      if (response.status === 'success') {
        console.log('Setting validation data:', response.data);
        setValidationData(response.data);
        toast.success('Data retrieved successfully');
      } else {
        throw new Error(response.message || 'Validation failed');
      }
    } catch (err: any) {
      setError('Something went wrong');
      console.error('Error validating time series data:', err);
      toast.error('Something went wrong');
    } finally {
      setValidating(false);
    }
  };

  const handleDownloadReport = async (type: 'missing' | 'substituted') => {
    // For Demo-RNG, create and download a dummy CSV
    if (isDemo) {
      const csvContent = type === 'missing' 
        ? 'Start Time,End Time,Sensor Name,Missing Duration\n' +
          DEMO_MISSING_DATA.map(row => 
            `${row.start_datetime},${row.end_datetime},${row.sensor_name},${row.missing_duration}`
          ).join('\n')
        : 'Start Time,End Time,Sensor Name,Duration,Method\n' +
          DEMO_SUBSTITUTED_DATA.map(row => 
            `${row.start_datetime},${row.end_datetime},${row.sensor_name},${row.substituted_duration},${row.substitution_method}`
          ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demo-${type}-data-${DateTime.now().toFormat('yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Demo report downloaded successfully');
      return;
    }

    // Original download logic for non-demo customers
    toast.info(`Downloading ${type} data report...`);
    try {
      const siteName = selectedSite || JSON.parse(localStorage.getItem('selected_site') || '{}').name;
      if (!siteName) {
        throw new Error('No site selected');
      }

      const payload = {
        site_name: siteName
      };

      let endpoint = '';
      if (type === 'missing') {
        endpoint = '/reporting/v2/missing-data/download/';
      } else if (type === 'substituted') {
        endpoint = '/reporting/v2/substituted-data/download/';
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd')}-to-${DateTime.now().toFormat('yyyy-MM-dd')}-${type}-data-report-${siteName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report downloaded successfully');
    } catch (err: any) {
      console.error('Error downloading report:', err);
      toast.error('Failed to download report');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Missing Data Summary</h1>
          <p className="text-muted-foreground mt-2">
            Last 24 hours missing data substitution summary details
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Affected Sensors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {(isDemo ? DEMO_MISSING_DATA.length : validationData?.missing_data_summary?.missing_sensors_data?.length) || 0} sensors
                </span>
                <span className="text-xs text-muted-foreground">
                  {(isDemo ? DEMO_MISSING_DATA.length : validationData?.missing_data_summary?.missing_sensors_data?.length) || 0} ongoing outages
                </span>
              </div>
              <AlertTriangle className="ml-auto h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Substituted Data (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {totalSubstitutedMMBTU} MMBTU
                </span>
                <span className="text-xs text-green-600">
                  +22.5% from previous 24h period
                </span>
              </div>
              <ClockIcon className="ml-auto h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost of Substituted Gas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  ${costOfSubstitutedGas.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ${costPerMMBTU.toFixed(2)} per MMBTU
                </span>
              </div>
              <div className="ml-auto rounded-full bg-green-100 p-3">
                <span className="text-green-700 text-2xl">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-6">
        {validationData ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Data Summary</span>
                <Button 
                  onClick={validateTimeSeries} 
                  disabled={validating}
                  size="sm"
                >
                  {validating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Data'
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="missing" className="mt-6">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="missing" className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Missing Data</span>
                  </TabsTrigger>
                  <TabsTrigger value="substituted" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Substituted</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="missing">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">Time Range</h3>
                        <p className="text-sm text-muted-foreground">
                          {isDemo ? 'March 20, 2024 - March 21, 2024' : validationData?.missing_data_summary?.date_range}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport('missing')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <div className="p-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              {isDemo ? (
                                <>
                                  <th className="text-left pb-4">Start Time</th>
                                  <th className="text-left pb-4">End Time</th>
                                  <th className="text-left pb-4">Sensor Name</th>
                                  <th className="text-right pb-4">Missing Duration</th>
                                </>
                              ) : (
                                <>
                                  <th className="text-left pb-4">Sensor</th>
                                  <th className="text-right pb-4">Missing Data (%)</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {isDemo ? (
                              DEMO_MISSING_DATA.map((item, index) => (
                                <tr key={index} className={index !== DEMO_MISSING_DATA.length - 1 ? "border-b" : ""}>
                                  <td className="py-4">{DateTime.fromISO(item.start_datetime).toFormat('HH:mm:ss')}</td>
                                  <td className="py-4">{DateTime.fromISO(item.end_datetime).toFormat('HH:mm:ss')}</td>
                                  <td className="py-4">{item.sensor_name}</td>
                                  <td className="text-right">{item.missing_duration}</td>
                                </tr>
                              ))
                            ) : (
                              validationData?.missing_data_summary?.missing_sensors_data?.map((item, index) => (
                                <tr key={item.sensor} className={index !== (validationData?.missing_data_summary?.missing_sensors_data?.length || 0) - 1 ? "border-b" : ""}>
                                  <td className="py-4">{item.sensor}</td>
                                  <td className="text-right">
                                    <Badge 
                                      className={
                                        item["%missing"] > 75 ? "bg-red-100 text-red-800" :
                                        item["%missing"] > 25 ? "bg-yellow-100 text-yellow-800" :
                                        "bg-green-100 text-green-800"
                                      }
                                    >
                                      {item["%missing"].toFixed(2)}%
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="substituted">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Substituted Data</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport('substituted')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                  {isDemo ? (
                    <div className="rounded-md border">
                      <div className="p-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-4">Start Time</th>
                              <th className="text-left pb-4">End Time</th>
                              <th className="text-left pb-4">Sensor Name</th>
                              <th className="text-left pb-4">Duration</th>
                              <th className="text-right pb-4">Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {DEMO_SUBSTITUTED_DATA.map((item, index) => (
                              <tr key={index} className={index !== DEMO_SUBSTITUTED_DATA.length - 1 ? "border-b" : ""}>
                                <td className="py-4">{DateTime.fromISO(item.start_datetime).toFormat('HH:mm:ss')}</td>
                                <td className="py-4">{DateTime.fromISO(item.end_datetime).toFormat('HH:mm:ss')}</td>
                                <td className="py-4">{item.sensor_name}</td>
                                <td className="py-4">{item.substituted_duration}</td>
                                <td className="text-right">
                                  <Badge variant="outline">
                                    {item.substitution_method}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">No substituted data available yet</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 bg-gray-50 rounded-lg border border-dashed">
            {validating ? (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h3 className="text-lg font-medium">Loading Data Summary</h3>
                <p className="text-gray-500">Please wait while we fetch the latest data...</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">No Data Available</h3>
                <p className="text-gray-500">Click below to fetch the latest data summary.</p>
                <Button onClick={validateTimeSeries}>Fetch Data</Button>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
