'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { BASE_URL, defaultHeaders } from '@/lib/api';
interface CalculatorProps {
  inputs: { label: string; value: number }[];
  startDateTime: string;
  endDateTime: string;
  siteName?: string;
}

export default function SO2Calculator({ inputs, startDateTime, endDateTime, siteName }: CalculatorProps) {
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { hourlySO2: number; totalSO2: number; maxSO2: number; isExceeded: boolean }>>({});
  const [processedInputs, setProcessedInputs] = useState<{ label: string; value: number; maxSO2?: number }[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculate total hours between start and end dates
  const totalHours = DateTime.fromISO(endDateTime).diff(DateTime.fromISO(startDateTime), 'hours').hours;
  
  // Process inputs when they change
  useEffect(() => {
    if (inputs && inputs.length > 0) {
      // Filter out any inputs with zero or negative values
      const filteredInputs = inputs.slice(1);

      // Define site-specific mapping of labels to max permissible SO2 values
      const getSiteSpecificMaxSO2 = (siteName?: string): Record<string, number> => {
        console.log('🏭 getSiteSpecificMaxSO2 called with siteName:', siteName);
        
        const defaultValues = {
          'HG Biogas Flow to Flare (F702_FT301)': 0.0,
          'Off Spec to Flare (FT714)': 0.0,
          'Tox Flow (FIT1701)': 0.0,
          'Maassen Flare Flow (F702_FT301)': 0.0
        };

        // Site-specific overrides
        const siteSpecificValues: Record<string, Record<string, number>> = {
          'West Branch': {
            'HG Biogas Flow to Flare (F702_FT301)': 52.20,
            'Off Spec to Flare (FT714)': 52.20,
            'Tox Flow (FIT1701)': 55.16,
            'Maassen Flare Flow (F702_FT301)': 27.14
          },
          'Three Petals': {
            'Biogas to Flare Flow (F506_FT301)': 39.7,
            'Off Spec to Flare Flow (FI4623)': 39.7,
            'Tox Flow (FIT1701)': 39.5
          },
          'Red Leaf': {
            'BIOGAS to Flare Flow': 0.0,
            'OFF SPEC to Flare Flow': 0.0,
            'Tox Flow': 0.0
          },
          'Buckhorn': {
            'Biogas to Flare (F204_FT301)': 39.7, // Special case for Hoogland when only gas from Hoogland digester is flowing
            'Off Spec Gas to Flare Flow (FIT203)': 39.7,
            'Tox Flow (FIT1701)': 41.1
          }
          
        };

        const result = siteSpecificValues[siteName || ''] || defaultValues;
        console.log('📊 getSiteSpecificMaxSO2 returning:', result);
        return result;
      };

      const maxPermissibleSO2 = getSiteSpecificMaxSO2(siteName);
      console.log('✅ maxPermissibleSO2 result:', maxPermissibleSO2);

      // Process inputs with full labels
      var finalInputs = filteredInputs.map(item => ({
        ...item,
        maxSO2: maxPermissibleSO2[item.label] || 0
      }));
      
      const totalFlowValue = finalInputs.reduce((sum, item) => sum + item.value, 0);
      
      // Add the Total Flow item
      finalInputs.push({ 
        label: 'Total Flow',
        value: totalFlowValue,
        maxSO2: 0 // Default to 0 for total flow
      });
      
      console.log('Final processed inputs:', finalInputs);
      setProcessedInputs(finalInputs);
    }
  }, [inputs]);

  // Load saved inputs from localStorage on component mount
  useEffect(() => {
    const savedInputs = localStorage.getItem('so2CalculatorInputs');
    if (savedInputs) {
      try {
        const parsedInputs = JSON.parse(savedInputs) as Record<string, string>;
        // Clean up any old format data (remove shortened labels)
        const cleanInputs = Object.entries(parsedInputs).reduce((acc, [key, value]) => {
          // Only keep inputs that exactly match our current input labels
          if (inputs.some(input => input.label === key)) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>);
        
        setUserInputs(cleanInputs);
        // Update localStorage with clean data
        localStorage.setItem('so2CalculatorInputs', JSON.stringify(cleanInputs));
      } catch (error) {
        console.error('Error parsing saved inputs:', error);
        localStorage.removeItem('so2CalculatorInputs');
      }
    }
  }, [inputs]);

  const handleInputChange = (label: string, value: string) => {
    setUserInputs((prev) => {
      const newInputs = {
        ...prev,
        [label]: value,
      };
      // Save to localStorage with clean data
      localStorage.setItem('so2CalculatorInputs', JSON.stringify(newInputs));
      return newInputs;
    });
  };

  // Cleanup effect to remove old data format when component unmounts
  useEffect(() => {
    return () => {
      const savedInputs = localStorage.getItem('so2CalculatorInputs');
      if (savedInputs) {
        try {
          const parsedInputs = JSON.parse(savedInputs) as Record<string, string>;
          const cleanInputs = Object.entries(parsedInputs).reduce((acc, [key, value]) => {
            if (inputs.some(input => input.label === key)) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, string>);
          localStorage.setItem('so2CalculatorInputs', JSON.stringify(cleanInputs));
        } catch (error) {
          console.error('Error cleaning up saved inputs:', error);
          localStorage.removeItem('so2CalculatorInputs');
        }
      }
    };
  }, [inputs]);

  const calculateResults = async () => {
    try {
      // Check if date range is selected
      if (!startDateTime || !endDateTime) {
        toast.error('Please select a date range first');
        return;
      }

      setIsCalculating(true);

      // Filter out empty h2s values
      const filteredH2sValues = Object.entries(userInputs).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`${BASE_URL}/reporting/v2/so2-calculator/`, {
        method: 'POST',
        headers: { ...defaultHeaders },
        body: JSON.stringify({
          inputs: processedInputs.map(input => ({
            label: input.label,
            value: input.value
          })),
          start_date_time: startDateTime,
          end_date_time: endDateTime,
          site_name: siteName,
          h2s_values: filteredH2sValues
        })
      });

      if (!response.ok) throw new Error('Failed to calculate SO2');
      const data = await response.json();
      
      // Transform the API response to match our frontend format
      const transformedResults = Object.entries(data.results).reduce((acc, [key, value]: [string, any]) => {
        acc[key] = {
          hourlySO2: value.hourly_so2,
          totalSO2: value.total_so2,
          maxSO2: value.max_so2,
          isExceeded: value.is_exceeded
        };
        return acc;
      }, {} as Record<string, { hourlySO2: number; totalSO2: number; maxSO2: number; isExceeded: boolean }>);

      setResults(transformedResults);
    } catch (error) {
      toast.error('Failed to calculate SO2');
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>SO2 Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2 items-center font-semibold mb-2 border-b pb-2">
            <div>Source</div>
            <div>H2S (ppm)</div>
            <div>Max SO2 (lbs/hr)</div>
            <div>Hourly SO2 (lbs/hr)</div>
            <div>Total SO2 (lbs)</div>
          </div>
          {processedInputs.map(({ label, value, maxSO2 }) => (
            <div key={label} className="grid grid-cols-5 gap-2 items-center">
              <div className="font-medium">{label}</div>
              <Input
                type="number"
                placeholder="H2S (ppm)"
                value={userInputs[label] || ''}
                onChange={(e) => handleInputChange(label, e.target.value)}
              />
              <div className="text-sm">{maxSO2?.toFixed(2) || '--'}</div>
              {results[label] ? (
                <>
                  <div className={`text-sm flex items-center ${
                    results[label].isExceeded 
                      ? 'text-red-600 font-bold flex gap-2' 
                      : ''
                  }`}>
                    {results[label].hourlySO2.toFixed(2)}
                    {results[label].isExceeded && (
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                        Exceeded
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    {results[label].totalSO2.toFixed(2)}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-400">--</div>
                  <div className="text-sm text-gray-400">--</div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          onClick={calculateResults} 
          className="w-full"
          disabled={!startDateTime || !endDateTime || isCalculating}
        >
          {isCalculating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Calculating...
            </>
          ) : (
            'Calculate'
          )}
        </Button>
        {(!startDateTime || !endDateTime) && (
          <div className="text-amber-600 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Please select a date range to calculate SO2 values
          </div>
        )}
        {Object.values(results).some(result => result.isExceeded) && (
          <div className="text-red-600 text-sm">
            ⚠️ Some values exceed their maximum permitted SO2 limits
          </div>
        )}
        <div className="text-xs text-gray-500 italic mt-1">
          Note: Permitted limits are site-specific. {siteName === 'Hoogland' ? 'For Hoogland, HG Biogas limit is 29.42 lbs/hr when only gas from Hoogland digester is flowing.' : 'Contact your site administrator for specific permit limits.'}
        </div>
      </CardFooter>
    </Card>
  );
}
