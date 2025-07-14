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
import { Loader2, ClockIcon, AlertTriangle, CheckCircle2, Download, Upload, X, Factory, Calendar } from 'lucide-react';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MissingDataEntry {
  start_timestamp: string;
  end_timestamp: string;
  missing_duration: number;
  is_substituted: boolean;
  missing_sensors: string[]; // API response includes missing sensor names
  substitution_type?: 'automatic' | 'manual'; // Add substitution type for demo
  data_type?: 1 | 2 | 3 | 4 | 5 | 6; // Add data type classification
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
  substitution_info?: string; // Add substitution info for demo
}

// Keep demo data only for substituted data tab - missing data now uses API
const DEMO_MISSING_DATA: MissingDataEntry[] = [];

const DEMO_SUBSTITUTED_DATA: SubstitutedDataEntry[] = [
  {
    start_datetime: '2025-04-20T10:00:00',
    end_datetime: '2025-04-20T11:30:00',
    sensor_name: 'Flow Meter',
    substituted_duration: '1.5 hours',
    substitution_method: 'Linear Interpolation',
    substitution_info: 'Used adjacent data points for smooth interpolation'
  },
  {
    start_datetime: '2025-04-20T12:00:00',
    end_datetime: '2025-04-20T14:00:00',
    sensor_name: 'Pressure Sensor',
    substituted_duration: '2 hours',
    substitution_method: 'Last Known Value',
    substitution_info: 'Held last stable reading due to sensor calibration'
  },
  {
    start_datetime: '2025-04-20T15:00:00',
    end_datetime: '2025-04-20T16:45:00',
    sensor_name: 'Flare Sensor',
    substituted_duration: '1.75 hours',
    substitution_method: 'Average Value',
    substitution_info: 'Applied 24-hour rolling average during maintenance window'
  }
];

export default function DataSubstitutionPage() {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [validationData, setValidationData] = useState<MissingDataResponse | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'missing' | 'substituted'>('missing'); // Add tab state for demo

  // Calculate dynamic values from API response
  const calculateMissingStats = () => {
    if (!validationData) return { totalMissingDays: 0, totalMissingDuration: 0, siteInfo: '', missingCount: 0, substitutedCount: 0 };

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
    
    // Count missing vs substituted
    const missingCount = missingData.filter(entry => !entry.is_substituted).length;
    const substitutedCount = missingData.filter(entry => entry.is_substituted).length;
    
    return {
      totalMissingDays: uniqueDays.size,
      totalMissingDuration: totalMissingDuration,
      siteInfo: validationData.site || 'Unknown Site',
      missingCount,
      substitutedCount
    };
  };

  const { totalMissingDays, totalMissingDuration, siteInfo, missingCount, substitutedCount } = calculateMissingStats();

  // Helper function to format duration in user-friendly format
  const formatDuration = (durationInMinutes: number): string => {
    if (durationInMinutes < 60) {
      return `${durationInMinutes.toFixed(0)} min`;
    } else if (durationInMinutes < 1440) { // Less than 24 hours
      const hours = durationInMinutes / 60;
      return `${hours.toFixed(1)} hrs`;
    } else if (durationInMinutes < 43200) { // Less than 30 days (30 * 24 * 60)
      const days = durationInMinutes / 1440;
      return `${days.toFixed(1)} days`;
    } else {
      const months = durationInMinutes / 43200;
      return `${months.toFixed(1)} months`;
    }
  };

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
    } else {
      // For non-demo customers, automatically load data if site is already selected
      const storedSite = localStorage.getItem('selected_site');
      if (storedSite) {
        try {
          const siteData = JSON.parse(storedSite);
          if (siteData.name) {
            setSelectedSite(siteData.name);
            // Data will be loaded by the other useEffect when selectedSite changes
          }
        } catch (e) {
          console.error('Error parsing stored site:', e);
        }
      }
    }

    // Listen for site change events
    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      console.log('Site changed to:', site.name);
      
      if (!isCustomerDemo) {
        setValidationData(null);
      }
      setSelectedSite(site.name);
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    return () => window.removeEventListener('siteChange', handleSiteChange);
  }, []);

  useEffect(() => {
    if (!validating && (selectedSite || localStorage.getItem('selected_site'))) {
      validateTimeSeries();
    }
  }, [selectedSite]);

  const validateTimeSeries = async () => {
    try {
      setValidating(true);
      setError(null);
      setValidationData(null);

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

  const handleDownloadReport = async () => {
    // For Demo-RNG, create and download a dummy CSV
    if (isDemo) {
      const csvContent = 'Start Time,End Time,Missing Duration,Status\n' +
        DEMO_MISSING_DATA.map(row => 
          `${row.start_timestamp},${row.end_timestamp},${formatDuration(row.missing_duration)},${row.is_substituted ? 'Substituted' : 'Missing'}`
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demo-missing-data-${DateTime.now().toFormat('yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Demo report downloaded successfully');
      return;
    }

    // Original download logic for non-demo customers
    toast.info('Downloading missing data report...');
    try {
      const siteName = selectedSite || JSON.parse(localStorage.getItem('selected_site') || '{}').name;
      if (!siteName) {
        throw new Error('No site selected');
      }

      const endpoint = `/reporting/v2/missing-data-report/download/?site_name=${encodeURIComponent(siteName)}`;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd')}-to-${DateTime.now().toFormat('yyyy-MM-dd')}-missing-data-report-${siteName}.xlsx`;
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

  if (validating && !validationData) {
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
              Total Data Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {validationData?.total_records || 0} Events
                </span>
                {isDemo && validationData?.missing_data && (
                  <span className="text-xs text-muted-foreground">
                    {validationData.missing_data.filter(item => !item.is_substituted).length} Pending, {validationData.missing_data.filter(item => item.is_substituted).length} Auto-Substituted
                  </span>
                )}
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
                  {formatDuration(totalMissingDuration * 60)}
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
                  {isDemo ? 'EcoMethan Hube' : siteInfo}
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
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Data Records</CardTitle>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-2 w-2 text-red-600" />
                    </div>
                    <span className="text-sm font-medium">Missing Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-2 w-2 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Substituted</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={validateTimeSeries} 
                    disabled={validating}
                    variant="outline"
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
                  {/* Tab switching for Demo-RNG only */}
                  {isDemo && (
                    <div className="flex items-center space-x-4">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={activeTab === 'missing' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveTab('missing')}
                          className="rounded-md"
                        >
                          Missing Data
                        </Button>
                        <Button
                          variant={activeTab === 'substituted' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setActiveTab('substituted')}
                          className="rounded-md"
                        >
                          Substituted Data
                        </Button>
                      </div>
                      {activeTab === 'missing' && (
                        <div className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded">
                          {/* <span className="font-medium">Note:</span> Types 1-4 use automatic substitution, Types 5-6 require manual file upload */}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
              <div className="rounded-lg border bg-white">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Start Time</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>End Time</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        <div className="flex items-center justify-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{isDemo && activeTab === 'substituted' ? 'Substituted Duration' : 'Missing Duration'}</span>
                        </div>
                      </th>
                      {/* Show sensor name column for demo */}
                      {isDemo && (
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          <div className="flex items-center justify-center space-x-2">
                            <Factory className="h-4 w-4" />
                            <span>Sensor Name</span>
                          </div>
                        </th>
                      )}
                      {/* Show substitution info column for demo substituted data */}
                      {isDemo && activeTab === 'substituted' && (
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Substitution Info</span>
                          </div>
                        </th>
                      )}
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {isDemo && activeTab === 'substituted' ? 'Method' : 'Status'}
                      </th>
                      {((isDemo && activeTab === 'missing') || !isDemo) && (
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Render data based on active tab for demo, otherwise show missing data */}
                    {(() => {
                      if (isDemo) {
                        const dataToShow = activeTab === 'missing' 
                          ? validationData?.missing_data || [] // Use API data for missing data tab
                          : DEMO_SUBSTITUTED_DATA;
                        
                        return dataToShow.map((item, index) => {
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
                            return dt.isValid ? dt.toFormat('yyyy-MM-dd HH:mm:ss') : timestamp;
                          };

                          if (activeTab === 'missing') {
                            const missingItem = item as MissingDataEntry;
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {parseTimestamp(missingItem.start_timestamp)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {parseTimestamp(missingItem.end_timestamp)}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                  {formatDuration(missingItem.missing_duration)}
                                </td>
                                                                 <td className="px-6 py-4 text-center text-sm text-gray-900">
                                   <div className="flex flex-wrap gap-1 justify-center">
                                     {(missingItem.missing_sensors || ['Unknown']).map((sensor: string, sensorIndex: number) => (
                                       <Badge 
                                         key={sensorIndex}
                                         variant="secondary"
                                         className="bg-blue-50 text-blue-700 text-xs"
                                       >
                                         {sensor}
                                       </Badge>
                                     ))}
                                   </div>
                                 </td>
                                                                 <td className="px-6 py-4 text-center">
                                   <Badge 
                                     variant={missingItem.is_substituted ? "default" : "destructive"}
                                     className={
                                       missingItem.is_substituted 
                                         ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                         : "bg-red-100 text-red-800 hover:bg-red-200"
                                     }
                                   >
                                     {missingItem.is_substituted ? (
                                       <div className="flex items-center space-x-1">
                                         <CheckCircle2 className="h-3 w-3" />
                                         <span>Auto-Substituted</span>
                                       </div>
                                     ) : (
                                       <div className="flex items-center space-x-1">
                                         <AlertTriangle className="h-3 w-3" />
                                         <span>Missing</span>
                                       </div>
                                     )}
                                   </Badge>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                   {/* Show substitute button for all non-substituted items from API */}
                                   {!missingItem.is_substituted && (
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleSubstituteClick(index)}
                                       className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                                     >
                                       <Upload className="h-4 w-4 mr-2" />
                                       Upload File
                                     </Button>
                                   )}
                                   {missingItem.is_substituted && (
                                     <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                       <div className="flex items-center space-x-1">
                                         <CheckCircle2 className="h-3 w-3" />
                                         <span>Auto-Applied</span>
                                       </div>
                                     </Badge>
                                   )}
                                 </td>
                              </tr>
                            );
                          } else {
                            const substitutedItem = item as SubstitutedDataEntry;
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {parseTimestamp(substitutedItem.start_datetime)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {parseTimestamp(substitutedItem.end_datetime)}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                  {substitutedItem.substituted_duration}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                  {substitutedItem.sensor_name}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                  <div className="max-w-xs mx-auto">
                                    <span className="text-xs text-gray-600" title={substitutedItem.substitution_info}>
                                      {substitutedItem.substitution_info}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Badge 
                                    variant="default"
                                    className="bg-green-100 text-green-800 hover:bg-green-200"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>{substitutedItem.substitution_method}</span>
                                    </div>
                                  </Badge>
                                </td>
                              </tr>
                            );
                          }
                        });
                      } else {
                        // Non-demo logic (original)
                        return (validationData?.missing_data || []).map((item, index) => {
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
                            return dt.isValid ? dt.toFormat('yyyy-MM-dd HH:mm:ss') : timestamp;
                          };

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {parseTimestamp(item.start_timestamp)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {parseTimestamp(item.end_timestamp)}
                              </td>
                              <td className="px-6 py-4 text-center text-sm text-gray-900">
                                {formatDuration(item.missing_duration)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge 
                                  variant={item.is_substituted ? "default" : "destructive"}
                                  className={
                                    item.is_substituted 
                                      ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                      : "bg-red-100 text-red-800 hover:bg-red-200"
                                  }
                                >
                                  {item.is_substituted ? (
                                    <div className="flex items-center space-x-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>Substituted</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>Missing</span>
                                    </div>
                                  )}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {!item.is_substituted && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSubstituteClick(index)}
                                    className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Substitute
                                  </Button>
                                )}
                                {item.is_substituted && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <div className="flex items-center space-x-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>Auto Applied</span>
                                    </div>
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 bg-gray-50 rounded-lg border border-dashed">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-medium">Loading Data Summary</h3>
              <p className="text-gray-500">Please wait while we fetch the latest data...</p>
            </div>
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
