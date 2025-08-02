'use client';

import { useState, useEffect } from 'react';
import { api, BASE_URL, defaultHeaders } from '@/lib/api';
import { DateTime } from 'luxon';
import { ToastContainer, toast } from 'react-toastify';
import { ClockIcon, AlertTriangle, CheckCircle2, Download, Upload, X, Factory, Calendar } from 'lucide-react';
import { InsightLoader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trackMissingDataViewOpened } from '@/lib/mixpanel';
import { getStoredCustomer, getStoredUser } from '@/lib/auth';

interface MissingDataEntry {
  start_timestamp: string;
  end_timestamp: string;
  missing_duration: number;
  is_substituted: boolean;
  missing_sensors: string[]; // API response includes missing sensor names
  substitution_type?: 'automatic' | 'manual'; // Add substitution type for demo
  substitution_method?: string; // Add substitution method from API
}

interface MissingDataResponse {
  site: string;
  view_name: string;
  missing_data: MissingDataEntry[];
  total_records: number;
}

export default function DataSubstitutionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [validationData, setValidationData] = useState<MissingDataResponse | null>(null);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'missing' | 'substituted'>('missing');
  const [isSubstituting, setIsSubstituting] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const user = getStoredUser();

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

  // Helper function to format duration in days, hours, minutes format
  const formatDuration = (durationInMinutes: number): string => {
    const days = Math.floor(durationInMinutes / 1440); // 1440 = 24 * 60
    const remainingMinutesAfterDays = durationInMinutes % 1440;
    const hours = Math.floor(remainingMinutesAfterDays / 60);
    const minutes = Math.floor(remainingMinutesAfterDays % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days} days`);
    if (hours > 0) parts.push(`${hours} hrs`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes} min`);
    
    return parts.join(' ');
  };

  // Helper function to get timezone from timestamp
  const getSiteTimezone = () => {
    if (!validationData || !validationData.missing_data.length) return 'UTC';
    
    try {
      const firstEntry = validationData.missing_data[0];
      const timestamp = firstEntry.start_timestamp;
      
      // Try to extract timezone from timestamp string
      if (timestamp.includes('US/Eastern')) return 'EDT';
      if (timestamp.includes('US/Central')) return 'CDT';
      
      return 'UTC';
    } catch (e) {
      return 'UTC';
    }
  };

  useEffect(() => {
    // Load data if site is already selected
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

    // Listen for site change events
    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      console.log('Site changed to:', site.name);
      setValidationData(null);
      setSelectedSite(site.name);
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    return () => window.removeEventListener('siteChange', handleSiteChange);
  }, []);

  useEffect(() => {
    const customer = getStoredCustomer();
    setIsDemo(customer?.name === 'Demo-RNG');
  }, []);

  useEffect(() => {
    if (!loading && (selectedSite || localStorage.getItem('selected_site'))) {
      fetchMissingData();
    }
  }, [selectedSite]);

  const fetchMissingData = async () => {
    try {
      setLoading(true);
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
      console.error('Error loading time series data:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!validationData) {
      toast.error('No data available to download');
      return;
    }

    // Filter data based on active tab
    const filteredData = activeTab === 'missing' 
      ? validationData.missing_data.filter(row => !row.is_substituted)
      : validationData.missing_data.filter(row => row.is_substituted);

    const fileName = activeTab === 'missing' 
      ? `missing-data-${DateTime.now().toFormat('yyyy-MM-dd')}.csv`
      : `substituted-data-${DateTime.now().toFormat('yyyy-MM-dd')}.csv`;

    const csvContent = activeTab === 'missing'
      ? 'Start Time,End Time,Missing Duration,Missing Sensors,Status\n' +
        filteredData.map(row => 
          `${row.start_timestamp},${row.end_timestamp},${formatDuration(row.missing_duration)},${row.missing_sensors?.join(';') || 'N/A'},${row.is_substituted ? 'Substituted' : 'Missing'}`
        ).join('\n')
      : 'Start Time,End Time,Substituted Duration,Missing Sensors,Substitution Info,Method\n' +
        filteredData.map(row => 
          `${row.start_timestamp},${row.end_timestamp},${formatDuration(row.missing_duration)},${row.missing_sensors?.join(';') || 'N/A'},${row.substitution_method || 'No Substitution Info'},${row.substitution_method === 'file_upload' ? 'Manual' : 'Automatic Substitution'}`
        ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Report downloaded successfully');
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

  // API function for file upload substitution
  const handleSubstituteData = async (file: File, rowIndex: number) => {
    console.log('handleSubstituteData called with:', { fileName: file.name, rowIndex });
    setUploading(true);
    setIsSubstituting(true);
    
    try {
      // Get the selected row data from missing data only
      const missingDataRows = validationData?.missing_data.filter(item => !item.is_substituted) || [];
      const selectedRow = missingDataRows[rowIndex];
      if (!selectedRow) {
        throw new Error('Selected row not found in missing data');
      }

      // Get site name
      const siteName = selectedSite || JSON.parse(localStorage.getItem('selected_site') || '{}').name;
      if (!siteName) {
        throw new Error('No site selected');
      }

      // Prepare FormData payload for file upload
      const formData = new FormData();
      formData.append('site_name', siteName);
      formData.append('start_timestamp', selectedRow.start_timestamp);
      formData.append('end_timestamp', selectedRow.end_timestamp);
      formData.append('file', file);

      // Log API call details
      console.log('Making API call with data:', {
        site_name: siteName,
        start_timestamp: selectedRow.start_timestamp,
        end_timestamp: selectedRow.end_timestamp,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      });
      
      // Create headers without Content-Type to let browser set it for FormData
      const headers = { ...defaultHeaders };
      delete headers['Content-Type'];
      
      const response = await fetch(`${BASE_URL}/reporting/v2/missing-data/substitute/`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Show success message
      toast.success('Data substitution completed successfully!');
      
      // Reset form and close modal
      setUploadedFile(null);
      setSelectedRowIndex(null);
      setSubstituteModalOpen(false);
      
      // Wait for toast to be visible before reloading
      setTimeout(() => {
        // Reload the page to show updated data
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error uploading substitution file:', error);
      toast.error(error.message || 'Failed to upload substitution file');
    } finally {
      setUploading(false);
      setIsSubstituting(false);
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

    console.log('Submitting substitution for row:', selectedRowIndex, 'with file:', uploadedFile.name);
    await handleSubstituteData(uploadedFile, selectedRowIndex);
  };

  // Track page view in Mixpanel
  useEffect(() => {
    if (user) {
      trackMissingDataViewOpened(user?.id, user?.email, getStoredCustomer()?.name, selectedSite);
    } else {
      throw new Error('No user found');
    }
    // We intentionally omit selectedSite from deps to ensure a single fire on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading && !validationData) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="flex flex-row items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
          <InsightLoader size="default" />
          <div className="text-lg font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  // Add loading overlay for substitution
  if (isSubstituting) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-lg shadow-lg">
          <InsightLoader size="lg" />
          <div className="text-lg font-medium">Substituting data...</div>
          <div className="text-sm text-gray-500">Please wait while we process your request</div>
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
                {validationData?.missing_data && (
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
              Total Filled Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {formatDuration(((validationData?.missing_data || []).filter(item => item.is_substituted).reduce((sum, item) => sum + (item.missing_duration || 0), 0) / 60) * 60)}
                </span>
              </div>
              <CheckCircle2 className="ml-auto h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-6">
        {validationData ? (
          <Card className="w-full">
            <CardHeader>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
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
                        Filled Data
                      </Button>
                    </div>
                  </div>
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
            </CardHeader>
            <CardContent>
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
                          <span>{activeTab === 'substituted' ? 'Filled Duration' : 'Missing Duration'}</span>
                        </div>
                      </th>
                      {isDemo && (
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          <div className="flex items-center justify-center space-x-2">
                            <Factory className="h-4 w-4" />
                            <span>Sensor Name</span>
                          </div>
                        </th>
                      )}
                      {activeTab === 'substituted' && (
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Substitution Info</span>
                          </div>
                        </th>
                      )}
                      <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {activeTab === 'substituted' ? 'Method' : 'Status'}
                      </th>
                      {activeTab === 'missing' && (
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Render data based on active tab for demo, otherwise show missing data */}
                    {(() => {
                      if (validationData?.missing_data) {
                        const missingData = validationData.missing_data.filter(item => !item.is_substituted);
                        const substitutedData = validationData.missing_data.filter(item => item.is_substituted);
                        
                        const dataToShow = activeTab === 'missing' ? missingData : substitutedData;
                        
                        return dataToShow.map((item, index) => {
                          // Helper function to parse timestamp safely
                          const parseTimestamp = (timestamp: string) => {
                            const timezone = getSiteTimezone();
                            // Try different parsing methods
                            let dt = DateTime.fromSQL(timestamp, { zone: timezone });
                            if (!dt.isValid) {
                              dt = DateTime.fromISO(timestamp, { zone: timezone });
                            }
                            if (!dt.isValid) {
                              dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss', { zone: timezone });
                            }
                            if (!dt.isValid) {
                              dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss z', { zone: timezone });
                            }
                            if (!dt.isValid) {
                              dt = DateTime.fromFormat(timestamp, 'yyyy-MM-dd HH:mm:ss T', { zone: timezone });
                            }
                            return dt.isValid ? dt.toFormat('yyyy-MM-dd HH:mm:ss z') : timestamp;
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
                              {/* Show missing sensors column only for Demo-RNG */}
                              {isDemo && (
                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                  {item.missing_sensors?.join(', ') || 'N/A'}
                                </td>
                              )}
                              {/* Substitution Info Column */}
                              <td className="px-6 py-4 text-center">
                                {activeTab === 'missing' ? (
                                  <Badge 
                                    variant="destructive"
                                    className="bg-red-100 text-red-800 hover:bg-red-200"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>Missing</span>
                                    </div>
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant="default"
                                    className="bg-green-100 text-green-800 hover:bg-green-200"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>{item.substitution_method || 'No Substitution Info'}</span>
                                    </div>
                                  </Badge>
                                )}
                              </td>
                              {/* Method Column */}
                              {activeTab === 'substituted' && (
                                <td className="px-6 py-4 text-center">
                                  <Badge 
                                    variant="default"
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>{item.substitution_method === 'File Upload' ? 'Manual' : 'Automatic Substitution'}</span>
                                    </div>
                                  </Badge>
                                </td>
                              )}
                              {activeTab === 'missing' && (
                                <td className="px-6 py-4 text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSubstituteClick(index)}
                                    className="bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Fill Missing Data
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        });
                      }
                      return null;
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 bg-gray-50 rounded-lg border border-dashed">
            <div className="text-center space-y-4">
              <InsightLoader size="lg" />
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
            <DialogTitle>Upload Missing Data Values</DialogTitle>
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
                onClick={() => {
                  console.log('Upload button clicked, uploadedFile:', uploadedFile?.name, 'selectedRowIndex:', selectedRowIndex);
                  handleSubmitSubstitution();
                }}
                disabled={!uploadedFile || uploading}
              >
                {uploading ? (
                  <>
                    <InsightLoader size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Fill Data
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
