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

interface ViewsResponse {
  views: GasBalanceView[];
}

interface ValidationResponse {
  status: string;
  message: string;
  data: {
    site_name: string;
    view_name: string;
    missing: string[];
    out_of_range?: string[];
    duplicates?: string[];
  };
}

export default function DataSubstitutionPage() {
  const [views, setViews] = useState<GasBalanceView[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<GasBalanceView | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [validationData, setValidationData] = useState<ValidationResponse['data'] | null>(null);

  useEffect(() => {
    fetchViews();
  }, [selectedSite]);

  // Listen for site change events
  useEffect(() => {
    const handleSiteChange = (event: any) => {
      const { site } = event.detail;
      console.log('Site changed to:', site.name);
      
      setLoading(true); // Show loading state while changing site
      setSelectedView(null); // Clear the selected view
      setSelectedSite(site.name); // Set the new site
      setValidationData(null); // Clear any validation data
    };
    
    window.addEventListener('siteChange', handleSiteChange);
    
    return () => {
      window.removeEventListener('siteChange', handleSiteChange);
    };
  }, []);

  const fetchViews = async () => {
    try {
      setLoading(true);
      var selected_site = JSON.parse(localStorage.getItem('selected_site') || '{}');
      var site_name = selected_site.name;
      const response = await api.get<ViewsResponse>(`/reporting/v2/views/?site_name=${site_name}`);
      setViews(response.views);
    } catch (err) {
      setError('Failed to load views');
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

      if (!selectedView) {
        throw new Error('No view selected');
      }

      if (!startDate || !endDate) {
        throw new Error('Please select both start and end dates');
      }

      const payload = {
        start_date: startDate,
        end_date: endDate,
        site_name: selectedSite || JSON.parse(localStorage.getItem('selected_site') || '{}').name,
        view_name: selectedView.view_name
      };

      const response = await api.post<ValidationResponse>('/reporting/v2/time-series/missing-data-validation/', payload);
      
      if (response.status === 'success') {
        setValidationData(response.data);
        toast.success('Validation completed successfully');
      } else {
        throw new Error(response.message || 'Validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate time series data');
      console.error('Error validating time series data:', err);
      toast.error(err.message || 'Failed to validate time series data');
    } finally {
      setValidating(false);
    }
  };

  const handleSubstitute = (timestamp: string) => {
    toast.info(`Substitution for ${timestamp} would happen here`);
    // Implement actual substitution functionality here
  };

  const handleSubstituteAll = () => {
    if (!validationData || validationData.missing.length === 0) return;
    
    toast.info(`Substituting all ${validationData.missing.length} missing data points`);
    // Implement batch substitution functionality here
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
        <div className="w-full md:w-1/3">
          <div className="flex flex-col space-y-4">
            <Select
              value={selectedView?.id}
              onValueChange={(value: string) => {
                const view = views.find((view) => view.id === value);
                if (view) {
                  setSelectedView(view);
                  setValidationData(null);
                }
              }}
            >
              <SelectTrigger className="w-full">
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

            <FloatingLabelInput
              label="Start Date (EST)"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
              max={endDate}
            />

            <FloatingLabelInput
              label="End Date (EST)"
              type="datetime-local"
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />

            <Button 
              onClick={validateTimeSeries}
              disabled={!selectedView || !startDate || !endDate || validating}
              className="w-full"
            >
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate Data'
              )}
            </Button>
          </div>
        </div>

        {validationData ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Data Validation Results</span>
                {validationData.missing.length > 0 && (
                  <Button 
                    onClick={handleSubstituteAll}
                    variant="outline"
                  >
                    Substitute All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validationData.missing.length === 0 && 
               (!validationData.out_of_range || validationData.out_of_range.length === 0) && 
               (!validationData.duplicates || validationData.duplicates.length === 0) ? (
                <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                  <CheckCircle2 className="mr-2 text-green-600" size={24} />
                  <span className="text-green-800 font-medium">Hurray! No data issues found in the selected time range</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">View:</span> 
                    <span>{validationData.view_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Site:</span> 
                    <span>{validationData.site_name}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Missing:</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        {validationData.missing.length}
                      </span>
                    </div>
                    
                    {validationData.out_of_range && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Out of Range:</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                          {validationData.out_of_range.length}
                        </span>
                      </div>
                    )}
                    
                    {validationData.duplicates && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Duplicates:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {validationData.duplicates.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {validationData.missing.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <ClockIcon className="mr-2 text-yellow-500" size={18} />
                        Missing Timestamps
                      </h3>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {validationData.missing.map((timestamp) => (
                          <div 
                            key={timestamp} 
                            className="bg-gray-50 p-3 rounded flex justify-between items-center"
                          >
                            <span>{timestamp}</span>
                            <Button 
                              size="sm" 
                              onClick={() => handleSubstitute(timestamp)}
                            >
                              Substitute
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {validationData.out_of_range && validationData.out_of_range.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <AlertTriangle className="mr-2 text-orange-500" size={18} />
                        Out of Range Timestamps
                      </h3>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {validationData.out_of_range.map((timestamp) => (
                          <div 
                            key={timestamp} 
                            className="bg-gray-50 p-3 rounded flex justify-between items-center"
                          >
                            <span>{timestamp}</span>
                            <Button 
                              size="sm" 
                              onClick={() => handleSubstitute(timestamp)}
                            >
                              Substitute
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {validationData.duplicates && validationData.duplicates.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <AlertTriangle className="mr-2 text-blue-500" size={18} />
                        Duplicate Timestamps
                      </h3>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {validationData.duplicates.map((timestamp) => (
                          <div 
                            key={timestamp} 
                            className="bg-gray-50 p-3 rounded flex justify-between items-center"
                          >
                            <span>{timestamp}</span>
                            <Button 
                              size="sm" 
                              onClick={() => handleSubstitute(timestamp)}
                            >
                              Substitute
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 bg-gray-50 rounded-lg border border-dashed">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No Missing Data Results</h3>
              <p className="text-gray-500">Select a view and date range, then click "Validate Data" to find missing data points.</p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
