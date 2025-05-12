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
import { Loader2, ClockIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ViewsResponse {
  views: GasBalanceView[];
}

interface ValidationResponse {
  status: string;
  message: string;
  data: {
    site: string;
    view: string;
    sensor_missing_data: {
      date_range: string;
      count: number;
      invalid_columns: string[];
      is_substituted: boolean;
      substitution_info: Record<string, any>;
    }[];
    aveva_missing_timestamps: {
      date_range: string;
      count: number;
      is_substituted: boolean;
      substitution_info: Record<string, any>;
    }[];
  };
}

export default function DataSubstitutionPage() {
  const [views, setViews] = useState<GasBalanceView[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [validationData, setValidationData] = useState<ValidationResponse['data'] | null>(null);
  const [substitutingItems, setSubstitutingItems] = useState<Record<string, boolean>>({});
  const [substitutingAll, setSubstitutingAll] = useState(false);

  useEffect(() => {
    fetchViews();
  }, [selectedSite]);

  // Listen for site change events
  useEffect(() => {
    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      console.log('Site changed to:', site.name);
      
      setLoading(true); // Show loading state while changing site
      setSelectedSite(site.name); // Set the new site
      setValidationData(null); // Clear any validation data
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    
    return () => {
      window.removeEventListener('siteChange', handleSiteChange);
    };
  }, []);

  // Automatically validate time series data when site changes
  useEffect(() => {
    if (!validationData && (selectedSite || localStorage.getItem('selected_site'))) {
      validateTimeSeries();
    }
  }, [selectedSite]);  // Add selectedSite to dependency array

  const fetchViews = async () => {
    try {
      setLoading(true);
      var selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
      var site_name = selected_site.name;
      const response = await api.get<ViewsResponse>(`/reporting/v2/views/?site_name=${site_name}`);
      setViews(response.views);
    } catch (err) {
      setError('Something went wrong');
      console.error('Error fetching views:', err);
    } finally {
      setLoading(false);
    }
  };

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
        toast.success('Validation completed successfully');
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

  // Helper function to format duration in minutes to days, hours, minutes format
  const formatDuration = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const handleSubstituteSensorData = async (dateRange: string) => {
    try {
      setSubstitutingItems(prev => ({ ...prev, [dateRange]: true }));
      
      // Parse the dateRange string to extract start and end dates
      const [startDateStr, endDateStr] = dateRange.split(' to ');
      
      const payload = {
        site_name: selectedSite || JSON.parse(localStorage.getItem('selected_site') || '{}').name,
        start_date: startDateStr,
        end_date: endDateStr,
        data_type: 'sensor'
      };

      const response = await api.post<{
        status: string;
        message?: string;
        data: {
          total_substituted: number;
        }
      }>('/reporting/v2/time-series/missing-data-validation/substitute/', payload);
      
      if (response.status === 'success') {
        toast.success(response.message || `Successfully substituted sensor data for ${dateRange}`);
        
        // Update validation data to mark the substituted date range
        if (validationData) {
          setValidationData({
            ...validationData,
            sensor_missing_data: validationData.sensor_missing_data.map(item => 
              item.date_range === dateRange 
                ? { ...item, is_substituted: true } 
                : item
            )
          });
        }
      } else {
        throw new Error(response.message || 'Substitution failed');
      }
    } catch (err: any) {
      console.error('Error substituting sensor data:', err);
      toast.error('Something went wrong');
    } finally {
      setSubstitutingItems(prev => ({ ...prev, [dateRange]: false }));
    }
  };

  const handleSubstituteAvevaData = async (dateRange: string) => {
    try {
      setSubstitutingItems(prev => ({ ...prev, [dateRange]: true }));
      
      // Parse the dateRange string to extract start and end dates
      const [startDateStr, endDateStr] = dateRange.split(' to ');
      
      const payload = {
        site_name: selectedSite || JSON.parse(localStorage.getItem('selected_site') || '{}').name,
        start_date: startDateStr,
        end_date: endDateStr,
        data_type: 'aveva'
      };

      const response = await api.post<{
        status: string;
        message?: string;
        data: {
          total_substituted: number;
        }
      }>('/reporting/v2/time-series/missing-data-validation/substitute/', payload);
      
      if (response.status === 'success') {
        toast.success(response.message || `Successfully substituted AVEVA data for ${dateRange}`);
        
        // Update validation data to mark the substituted date range
        if (validationData) {
          setValidationData({
            ...validationData,
            aveva_missing_timestamps: validationData.aveva_missing_timestamps.map(item => 
              item.date_range === dateRange 
                ? { ...item, is_substituted: true } 
                : item
            )
          });
        }
      } else {
        throw new Error(response.message || 'Substitution failed');
      }
    } catch (err: any) {
      console.error('Error substituting AVEVA data:', err);
      toast.error('Something went wrong');
    } finally {
      setSubstitutingItems(prev => ({ ...prev, [dateRange]: false }));
    }
  };

  const handleSubstituteAllSensorData = async () => {
    if (!validationData || !validationData.sensor_missing_data || validationData.sensor_missing_data.length === 0) return;
    
    try {
      setSubstitutingAll(true);
      toast.info('Substitute all functionality is currently disabled');
      // If this gets enabled in the future, update to use start_date and end_date instead of date_ranges
    } catch (err: any) {
      console.error('Error:', err);
      toast.error('Something went wrong');
    } finally {
      setSubstitutingAll(false);
    }
  };

  const handleSubstituteAllAvevaData = async () => {
    if (!validationData || !validationData.aveva_missing_timestamps || validationData.aveva_missing_timestamps.length === 0) return;
    
    try {
      setSubstitutingAll(true);
      toast.info('Substitute all functionality is currently disabled');
      // If this gets enabled in the future, update to use start_date and end_date instead of date_ranges
    } catch (err: any) {
      console.error('Error:', err);
      toast.error('Something went wrong');
    } finally {
      setSubstitutingAll(false);
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
        <h1 className="text-2xl font-bold">Missing Data Substitution</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col space-y-6">
        {validationData ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Data Validation Results</span>
                <Button 
                  onClick={validateTimeSeries} 
                  disabled={validating}
                  size="sm"
                >
                  {validating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Refresh Data'
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!validationData.sensor_missing_data || validationData.sensor_missing_data.length === 0) && 
               (!validationData.aveva_missing_timestamps || validationData.aveva_missing_timestamps.length === 0) ? (
                <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                  <CheckCircle2 className="mr-2 text-green-600" size={24} />
                  <span className="text-green-800 font-medium">Hurray! No data issues found in the selected time range</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Site:</span> 
                    <span>{validationData.site}</span>
                  </div>
                  
                  {/* <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        <ClockIcon size={14} />
                        <span>Sensor Missing</span>
                        <span className="ml-1 border-l border-yellow-300 pl-1">
                          {formatDuration(validationData.sensor_missing_data.reduce((total, item) => total + item.count, 0))}
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                        <AlertTriangle size={14} />
                        <span>AVEVA Missing</span>
                        <span className="ml-1 border-l border-orange-300 pl-1">
                          {formatDuration(validationData.aveva_missing_timestamps.reduce((total, item) => total + item.count, 0))}
                        </span>
                      </span>
                    </div>
                  </div> */}

                  <Tabs defaultValue="sensor" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="sensor" className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-yellow-500" />
                        <span>Sensor Missing</span>
                        <span className="ml-1 text-xs text-yellow-600">
                          ({formatDuration(validationData.sensor_missing_data.reduce((total, item) => total + item.count, 0))})
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="aveva" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span>AVEVA Missing</span>
                        <span className="ml-1 text-xs text-orange-600">
                          ({formatDuration(validationData.aveva_missing_timestamps.reduce((total, item) => total + item.count, 0))})
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="substituted" className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Substituted</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="sensor">
                      <div className="mt-2">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <ClockIcon className="mr-2 text-yellow-500" size={18} />
                          Sensor Missing Data
                          <span className="ml-2 text-sm text-yellow-600">
                            (Total: {formatDuration(validationData.sensor_missing_data.reduce((total, item) => total + item.count, 0))})
                          </span>
                          <Button 
                            onClick={() => toast.info('Sensor substitution functionality is currently not available')}
                            variant="outline"
                            size="sm"
                            className="ml-3"
                            disabled={substitutingAll}
                          >
                            {substitutingAll ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Substituting...
                              </>
                            ) : (
                              'Substitute All'
                            )}
                          </Button>
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                          {validationData.sensor_missing_data && 
                           validationData.sensor_missing_data.filter(item => !item.is_substituted).length > 0 ? (
                            validationData.sensor_missing_data
                              .filter(item => !item.is_substituted)
                              .map((item, index) => (
                                <div 
                                  key={`sensor-${item.date_range}-${index}`} 
                                  className="bg-gray-50 p-3 rounded"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex flex-col">
                                      <span className="font-semibold">{item.date_range}</span>
                                      <span className="text-sm text-gray-500">
                                        Missing duration: {formatDuration(item.count)}
                                      </span>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      onClick={() => toast.info('Sensor substitution functionality is currently not available')}
                                      disabled={substitutingItems[item.date_range]}
                                    >
                                      {substitutingItems[item.date_range] ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        'Substitute'
                                      )}
                                    </Button>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-1">Missing columns ({item.invalid_columns.length}):</p>
                                    <div className="flex flex-wrap gap-1">
                                      {item.invalid_columns.map((column, idx) => (
                                        <span key={`${item.date_range}-${idx}`} className="text-red-600 text-xs px-2 py-1 rounded border border-red-200">
                                          {column}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                              <span className="text-gray-500">No sensor missing data found</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="aveva">
                      <div className="mt-2">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <AlertTriangle className="mr-2 text-orange-500" size={18} />
                          AVEVA Missing Timestamps
                          <span className="ml-2 text-sm text-orange-600">
                            (Total: {formatDuration(validationData.aveva_missing_timestamps.reduce((total, item) => total + item.count, 0))})
                          </span>
                          <Button 
                            onClick={handleSubstituteAllAvevaData}
                            variant="outline"
                            size="sm"
                            className="ml-3"
                            disabled={substitutingAll}
                          >
                            {substitutingAll ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Substituting...
                              </>
                            ) : (
                              'Substitute All'
                            )}
                          </Button>
                        </h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {validationData.aveva_missing_timestamps && 
                           validationData.aveva_missing_timestamps.filter(item => !item.is_substituted).length > 0 ? (
                            validationData.aveva_missing_timestamps
                              .filter(item => !item.is_substituted)
                              .map((item, index) => (
                                <div 
                                  key={`aveva-${item.date_range}-${index}`} 
                                  className="bg-gray-50 p-3 rounded flex justify-between items-center"
                                >
                                  <div className="flex flex-col">
                                    <span>{item.date_range}</span>
                                    <span className="text-sm text-gray-500">
                                      Missing duration: {formatDuration(item.count)}
                                    </span>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSubstituteAvevaData(item.date_range)}
                                    disabled={substitutingItems[item.date_range]}
                                  >
                                    {substitutingItems[item.date_range] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Substitute'
                                    )}
                                  </Button>
                                </div>
                              ))
                          ) : (
                            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                              <span className="text-gray-500">No AVEVA missing timestamps found</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="substituted">
                      <div className="mt-2">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <CheckCircle2 className="mr-2 text-green-500" size={18} />
                          Substituted Data
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                          {(validationData.sensor_missing_data && 
                            validationData.sensor_missing_data.some(item => item.is_substituted)) || 
                           (validationData.aveva_missing_timestamps && 
                            validationData.aveva_missing_timestamps.some(item => item.is_substituted)) ? (
                            <>
                              {validationData.sensor_missing_data && 
                               validationData.sensor_missing_data.filter(item => item.is_substituted).length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-medium mb-2 text-yellow-600">Sensor Data</h4>
                                  {validationData.sensor_missing_data
                                    .filter(item => item.is_substituted)
                                    .map((item, index) => (
                                      <div 
                                        key={`sensor-sub-${item.date_range}-${index}`} 
                                        className="bg-green-50 p-3 rounded mb-2 border border-green-100"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div className="flex flex-col">
                                            <span className="font-semibold">{item.date_range}</span>
                                            <span className="text-sm text-gray-500">
                                              Duration: {formatDuration(item.count)}
                                            </span>
                                          </div>
                                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                            Fixed
                                          </Badge>
                                        </div>
                                        <div className="mt-2">
                                          <p className="text-sm text-gray-500 mb-1">Substituted columns ({item.invalid_columns.length}):</p>
                                          <div className="flex flex-wrap gap-1">
                                            {item.invalid_columns.map((column, idx) => (
                                              <span key={`${item.date_range}-sub-${idx}`} className="text-green-600 text-xs px-2 py-1 rounded border border-green-200">
                                                {column}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}

                              {validationData.aveva_missing_timestamps && 
                               validationData.aveva_missing_timestamps.filter(item => item.is_substituted).length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 text-orange-600">AVEVA Timestamps</h4>
                                  {validationData.aveva_missing_timestamps
                                    .filter(item => item.is_substituted)
                                    .map((item, index) => (
                                      <div 
                                        key={`aveva-sub-${item.date_range}-${index}`} 
                                        className="bg-green-50 p-3 rounded mb-2 border border-green-100 flex justify-between items-center"
                                      >
                                        <div className="flex flex-col">
                                          <span>{item.date_range}</span>
                                          <span className="text-sm text-gray-500">
                                            Duration: {formatDuration(item.count)}
                                          </span>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                          Fixed
                                        </Badge>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                              <span className="text-gray-500">No substituted data found</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 bg-gray-50 rounded-lg border border-dashed">
            {validating ? (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h3 className="text-lg font-medium">Validating Time Series Data</h3>
                <p className="text-gray-500">Please wait while we check for missing data points...</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">No Missing Data Results</h3>
                <p className="text-gray-500">Click below to check for missing data points.</p>
                <Button onClick={validateTimeSeries}>Validate Data</Button>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
