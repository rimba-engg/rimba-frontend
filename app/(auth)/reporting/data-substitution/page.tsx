'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DateTime } from 'luxon';
import { type GasBalanceView } from '../rng-mass-balance/types';
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
  date_range: string;
  missing_sensors_data: SensorMissingData[];
  unique_sensor_count: number;
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

export default function DataSubstitutionPage() {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [validationData, setValidationData] = useState<ValidationResponse['data'] | null>(null);

  // Dummy values for demonstration
  const totalSubstitutedMMBTU = 287.5;
  const costPerMMBTU = 5.00;
  const costOfSubstitutedGas = totalSubstitutedMMBTU * costPerMMBTU;

  useEffect(() => {
    // Listen for site change events
    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      console.log('Site changed to:', site.name);
      
      setLoading(true);
      setSelectedSite(site.name);
      setValidationData(null);
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    return () => window.removeEventListener('siteChange', handleSiteChange);
  }, []);

  useEffect(() => {
    if (!validationData && (selectedSite || localStorage.getItem('selected_site'))) {
      validateTimeSeries();
    }
  }, [selectedSite]);

  const validateTimeSeries = async () => {
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
      
      if (response.status === 'success') {
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

  const handleDownloadReport = (type: 'missing' | 'substituted') => {
    toast.info(`Downloading ${type} data report...`);
    // Implement download functionality here
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
                  {validationData?.missing_data_summary.unique_sensor_count || 0} sensors
                </span>
                <span className="text-xs text-muted-foreground">
                  {validationData?.missing_data_summary.missing_sensors_data.length || 0} ongoing outages
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
                          {validationData.missing_data_summary.date_range}
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
                              <th className="text-left pb-4">Sensor</th>
                              <th className="text-right pb-4">Missing Data (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {validationData.missing_data_summary.missing_sensors_data.map((item, index) => (
                              <tr key={item.sensor} className={index !== validationData.missing_data_summary.missing_sensors_data.length - 1 ? "border-b" : ""}>
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
                            ))}
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
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">No substituted data available yet</span>
                  </div>
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
