'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
interface CalculatorProps {
  inputs: { label: string; value: number }[];
  startDateTime: string;
  endDateTime: string;
  siteName?: string;
}

export default function SO2Calculator({ inputs, startDateTime, endDateTime, siteName }: CalculatorProps) {
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { hourlySO2: number; totalSO2: number }>>({});
  const [processedInputs, setProcessedInputs] = useState<{ label: string; value: number; maxSO2?: number }[]>([]);
  
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
          'HG Biogas': 0.0,
          'Off Spec': 0.0,
          'Tox Flow': 0.0,
          'Maassen Flare': 0.0
        };

        // Site-specific overrides
        const siteSpecificValues: Record<string, Record<string, number>> = {
          'Buckhorn': {
            'Biogas to Flare (F204_FT301)': 39.7, // Special case for Hoogland when only gas from Hoogland digester is flowing
            'Off Spec Gas to Flare Flow (FIT203)': 39.7,
            'Tox Flow (FIT1701)': 41.1,
          },

          'West Branch': {
            'HG Biogas': 52.20,
            'Off Spec': 52.20,
            'Tox Flow': 55.16,
            'Maassen Flare': 27.14
          },

          'Three Petals':
          {
            "Biogas to Flare Flow (F506_FT301)": 39.7,
            "Off Spec to Flare Flow (FI4623)": 39.7,
            "Tox Flow (FIT1701)": 39.5,

          },

          'Red Leaf':
          {
            "BIOGAS to Flare Flow": 0.0,
            "OFF SPEC to Flare Flow": 0.0,
            "Tox Flow": 0.0,
          }
          // Add more sites as needed
        };

        const result = siteSpecificValues[siteName || ''] || defaultValues;
        console.log('📊 getSiteSpecificMaxSO2 returning:', result);
        return result;
      };

      const maxPermissibleSO2 = getSiteSpecificMaxSO2(siteName);
      console.log('✅ maxPermissibleSO2 result:', maxPermissibleSO2);

      // Debug: Log actual input labels for West Branch
      if (siteName === 'West Branch') {
        console.log('🔍 West Branch actual input labels:', filteredInputs.map(item => item.label));
      }

      // Create a flexible mapping function that can handle both exact matches and partial matches
      const getMaxSO2ForLabel = (label: string): number => {
        // First try exact match
        if (maxPermissibleSO2[label]) {
          return maxPermissibleSO2[label];
        }
        
        // For West Branch, create mapping from actual labels to config keys
        if (siteName === 'West Branch') {
          const westBranchMapping: Record<string, string> = {
            'HG Biogas': 'HG Biogas',
            'Off Spec': 'Off Spec', 
            'Tox Flow': 'Tox Flow',
            'Maassen Flare': 'Maassen Flare'
          };
          
          // Try partial matching - find config key that matches part of the label
          for (const [configKey, maxValue] of Object.entries(maxPermissibleSO2)) {
            if (label.toLowerCase().includes(configKey.toLowerCase()) || 
                configKey.toLowerCase().includes(label.toLowerCase())) {
              return maxValue;
            }
          }
          
          // Try specific West Branch patterns
          if (label.toLowerCase().includes('hg') || label.toLowerCase().includes('biogas')) {
            return maxPermissibleSO2['HG Biogas'] || 0;
          }
          if (label.toLowerCase().includes('off spec')) {
            return maxPermissibleSO2['Off Spec'] || 0;
          }
          if (label.toLowerCase().includes('tox')) {
            return maxPermissibleSO2['Tox Flow'] || 0;
          }
          if (label.toLowerCase().includes('maassen')) {
            return maxPermissibleSO2['Maassen Flare'] || 0;
          }
        }
        
        return 0;
      };

      // Get max SO2 value using flexible mapping, then shorten label for display
      var finalInputs = filteredInputs.map(item => {
        const words = item.label.split(' ');
        const shortenedLabel = words.slice(0, 2).join(' ');
        return {
          ...item,
          label: shortenedLabel,
          maxSO2: getMaxSO2ForLabel(item.label)
        };
      });
      
      const totalFlowValue = finalInputs.reduce((sum, item) => sum + item.value, 0);  
      // Add the Total Flow item to the end of the list with site-specific total flow max
      const getTotalFlowMax = (siteName?: string): number => {
        const siteSpecificTotalFlow: Record<string, number> = {};
        return siteSpecificTotalFlow[siteName || ''] || 0.0; // Default fallback
      };
      
      finalInputs.push({ 
        label: 'Total Flow', 
        value: totalFlowValue,
        maxSO2: getTotalFlowMax(siteName)
      });
      
      console.log(finalInputs);
      setProcessedInputs(finalInputs);
    }
  }, [inputs]);

  // Load saved inputs from localStorage on component mount
  useEffect(() => {
    const savedInputs = localStorage.getItem('so2CalculatorInputs');
    if (savedInputs) {
      setUserInputs(JSON.parse(savedInputs));
    }
  }, []);

  const handleInputChange = (label: string, value: string) => {
    setUserInputs((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const calculateResults = () => {
    if (isNaN(totalHours)) {
      console.log(totalHours)
      window.alert('Select a valid date range');
      return;
    }
    const newResults: Record<string, { hourlySO2: number; totalSO2: number }> = {};
    
    processedInputs.forEach(({ label, value }) => {
      const userValue = parseFloat(userInputs[label] || '0');
      
      // Formula 1: Multiply the user input by the predefined value
      const hourlySO2 = ((userValue * (value/totalHours)) / 1000000) *  0.16;
      
      // Formula 2: Square the user input and multiply by the predefined value
      const totalSO2 = hourlySO2 * totalHours;
      
      newResults[label] = { hourlySO2, totalSO2 };
      console.log(newResults)
    });
    
    setResults(newResults);
    
    // Save inputs to localStorage
    localStorage.setItem('so2CalculatorInputs', JSON.stringify(userInputs));
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
                    results[label].hourlySO2 > (maxSO2 || 0) 
                      ? 'text-red-600 font-bold flex gap-2' 
                      : ''
                  }`}>
                    {results[label].hourlySO2.toFixed(2)}
                    {results[label].hourlySO2 > (maxSO2 || 0) && (
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
        <Button onClick={calculateResults} className="w-full">Calculate</Button>
        {Object.entries(results).some(([_, result]) => 
          result.hourlySO2 > (processedInputs.find(i => i.label === _)?.maxSO2 || 0)
        ) && (
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
