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
import { Loader2, ClockIcon, AlertTriangle, CheckCircle2, Download, Upload, X, Factory } from 'lucide-react';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MissingDataEntry {
  start_timestamp: string;
  end_timestamp: string;
  missing_duration: number;
  is_substitued: boolean;
}

interface MissingDataResponse {
  site: string;
  view_name: string;
  missing_data: MissingDataEntry[];
  total_records: number;
}

interface SubstitutedDataEntry {
  start_datetime: string;
  end_datetime: string;
  sensor_name: string;
  substituted_duration: string;
  substitution_method: string;
}

// Updated demo data to match new structure
const DEMO_MISSING_DATA: MissingDataEntry[] = [
  {
    start_timestamp: '2025-04-20 10:00:00 EDT',
    end_timestamp: '2025-04-20 11:30:00 EDT',
    missing_duration: 1.5,
    is_substitued: false
  },
  {
    start_timestamp: '2025-04-20 12:00:00 EDT',
    end_timestamp: '2025-04-20 14:00:00 EDT',
    missing_duration: 2,
    is_substitued: false
  },
  {
    start_timestamp: '2025-04-20 15:00:00 EDT',
    end_timestamp: '2025-04-20 16:45:00 EDT',
    missing_duration: 1.75,
    is_substitued: true
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
  const [validationData, setValidationData] = useState<MissingDataResponse | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Calculate dynamic values from API response
  const calculateMissingStats = () => {
    if (!validationData) return { totalMissingDays: 0, totalMissingDuration: 0, siteInfo: '' };

    const missingData = validationData.missing_data || [];
    
    // Calculate total missing duration in hours (API returns in minutes)
    const totalMissingDuration = missingData.reduce((sum, entry) => sum + (entry.missing_duration || 0), 0) / 60;
    
    // Calculate unique missing days
    const uniqueDays = new Set();
    missingData.forEach(entry => {
      try {
        const startDate = DateTime.fromSQL(entry.start_timestamp) || DateTime.fromISO(entry.start_timestamp);
        if (startDate.isValid) {
          uniqueDays.add(startDate.toFormat('yyyy-MM-dd'));
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    });
    
    return {
      totalMissingDays: uniqueDays.size,
      totalMissingDuration: totalMissingDuration,
      siteInfo: validationData.site || 'Unknown Site'
    };
  };

  const { totalMissingDays, totalMissingDuration, siteInfo } = calculateMissingStats();

  // Helper function to get timezone from timestamp
  const getSiteTimezone = () => {
    if (!validationData || !validationData.missing_data.length) return 'UTC';
    
    try {
      const firstEntry = validationData.missing_data[0];
      const timestamp = firstEntry.start_timestamp;
      
      // Try to extract timezone from timestamp string
      if (timestamp.includes('EDT')) return 'EDT';
      if (timestamp.includes('EST')) return 'EST';
      if (timestamp.includes('PDT')) return 'PDT';
      if (timestamp.includes('PST')) return 'PST';
      if (timestamp.includes('CDT')) return 'CDT';
      if (timestamp.includes('CST')) return 'CST';
      if (timestamp.includes('MDT')) return 'MDT';
      if (timestamp.includes('MST')) return 'MST';
      
      return 'UTC';
    } catch (e) {
      return 'UTC';
    }
  };

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
        view_name: 'Demo View',
        missing_data: DEMO_MISSING_DATA,
        total_records: DEMO_MISSING_DATA.length
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
        view_name: 'Demo View',
        missing_data: DEMO_MISSING_DATA,
        total_records: DEMO_MISSING_DATA.length
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

      const response = await api.get<MissingDataResponse>(`/reporting/v2/missing-data/?site_name=${encodeURIComponent(siteName)}`);
      console.log('API Response:', response);
      
      console.log('Setting validation data:', response);
      setValidationData(response);
      toast.success('Data retrieved successfully');
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
        ? 'Start Time,End Time,Missing Duration (hours),Is Substituted\n' +
          DEMO_MISSING_DATA.map(row => 
            `${row.start_timestamp},${row.end_timestamp},${row.missing_duration},${row.is_substitued}`
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
        endpoint = `/reporting/v2/missing-data-report/download/?site_name=${encodeURIComponent(siteName)}`;
      } else if (type === 'substituted') {
        endpoint = '/reporting/v2/substituted-data/download/';
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: type === 'missing' ? 'GET' : 'POST',
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        },
        ...(type === 'substituted' && {
          body: JSON.stringify(payload)
        })
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

  // Dummy API function for file upload
  const handleSubstituteData = async (file: File, rowIndex: number) => {
    setUploading(true);
    
    try {
      // Simulate API call with FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('row_index', rowIndex.toString());
      
      // Demo mode - just simulate success
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload time
        toast.success('Data substitution file uploaded successfully!');
      } else {
        // Real API call would go here
        // const response = await fetch(`${BASE_URL}/reporting/v2/substitute-data/`, {
        //   method: 'POST',
        //   headers: defaultHeaders,
        //   body: formData
        // });
        
        // For now, simulate success
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Data substitution file uploaded successfully!');
      }
      
      // Reset form and close modal
      setUploadedFile(null);
      setSelectedRowIndex(null);
      setSubstituteModalOpen(false);
      
      // Optionally refresh the data
      if (!isDemo) {
        validateTimeSeries();
      }
      
    } catch (error) {
      console.error('Error uploading substitution file:', error);
      toast.error('Failed to upload substitution file');
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Handle substitute button click
  const handleSubstituteClick = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    setSubstituteModalOpen(true);
  };

  // Handle form submission
  const handleSubmitSubstitution = async () => {
    if (!uploadedFile || selectedRowIndex === null) {
      toast.error('Please select a file to upload');
      return;
    }

    await handleSubstituteData(uploadedFile, selectedRowIndex);
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
              Total Missing Gas Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {(isDemo ? DEMO_MISSING_DATA.length : validationData?.total_records) || 0} Days
                </span>
              </div>
              <AlertTriangle className="ml-auto h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Missing Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {isDemo ? '5.25' : totalMissingDuration.toFixed(2)} hours
                </span>
              </div>
              <ClockIcon className="ml-auto h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-lg font-bold">
                  {isDemo ? 'GreenFlame BioEnergy' : siteInfo}
                </span>
                <span className="text-xs text-muted-foreground">
                  View: Methane Balance
                </span>
                <span className="text-xs text-muted-foreground">
                  Timezone: {isDemo ? 'EDT' : getSiteTimezone()}
                </span>
              </div>
              <Factory className="ml-auto h-8 w-8 text-blue-500" />
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
                    <div className="flex justify-end">
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
                              <th className="text-left pb-4">Start Time</th>
                              <th className="text-left pb-4">End Time</th>
                              <th className="text-center pb-4">Missing Duration(hours)</th>
                              <th className="text-right pb-4">Status</th>
                              <th className="text-right pb-4">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(isDemo ? DEMO_MISSING_DATA : validationData?.missing_data || []).map((item, index) => {
                              // Helper function to parse timestamp safely
                              const parseTimestamp = (timestamp: string) => {
                                // Try different parsing methods
                                let dt = DateTime.fromSQL(timestamp);
                                if (!dt.isValid) {
                                  dt = DateTime.fromISO(timestamp);
                                }
                                if (!dt.isValid) {
                                  dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss');
                                }
                                if (!dt.isValid) {
                                  dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss z');
                                }
                                if (!dt.isValid) {
                                  dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss T');
                                }
                                return dt.isValid ? dt.toFormat('MMM dd, yyyy HH:mm:ss') : timestamp;
                              };

                              // Convert minutes to hours for display
                              const durationInHours = isDemo ? item.missing_duration : (item.missing_duration / 60);

                              return (
                                <tr key={index} className={index !== ((isDemo ? DEMO_MISSING_DATA : validationData?.missing_data || []).length - 1) ? "border-b" : ""}>
                                  <td className="py-4">{parseTimestamp(item.start_timestamp)}</td>
                                  <td className="py-4">{parseTimestamp(item.end_timestamp)}</td>
                                  <td className="text-center">{durationInHours.toFixed(2)}</td>
                                  <td className="text-right">
                                    <Badge 
                                      className={
                                        item.is_substitued ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                      }
                                    >
                                      {item.is_substitued ? 'Substituted' : 'Missing'}
                                    </Badge>
                                  </td>
                                  <td className="text-right">
                                    {!item.is_substitued && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSubstituteClick(index)}
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Substitute
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
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
                            {DEMO_SUBSTITUTED_DATA.map((item, index) => {
                              // Helper function to parse timestamp safely for substituted data
                              const parseTimestamp = (timestamp: string) => {
                                // Try different parsing methods
                                let dt = DateTime.fromISO(timestamp);
                                if (!dt.isValid) {
                                  dt = DateTime.fromSQL(timestamp);
                                }
                                if (!dt.isValid) {
                                  dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss');
                                }
                                if (!dt.isValid) {
                                  dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss z');
                                }
                                if (!dt.isValid) {
                                  dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss T');
                                }
                                return dt.isValid ? dt.toFormat('HH:mm:ss') : timestamp;
                              };

                              return (
                                <tr key={index} className={index !== DEMO_SUBSTITUTED_DATA.length - 1 ? "border-b" : ""}>
                                  <td className="py-4">{parseTimestamp(item.start_datetime)}</td>
                                  <td className="py-4">{parseTimestamp(item.end_datetime)}</td>
                                  <td className="py-4">{item.sensor_name}</td>
                                  <td className="py-4">{item.substituted_duration}</td>
                                  <td className="text-right">
                                    <Badge variant="outline">
                                      {item.substitution_method}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
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

      {/* File Upload Modal */}
      <Dialog open={substituteModalOpen} onOpenChange={setSubstituteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Substitution Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select file to upload</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploadedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Selected: {uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFile(null)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Accepted formats: CSV, Excel (.xlsx, .xls)</p>
              <p>File should contain the missing data values for substitution.</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSubstituteModalOpen(false);
                  setUploadedFile(null);
                  setSelectedRowIndex(null);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSubstitution}
                disabled={!uploadedFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Substitute
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
}
