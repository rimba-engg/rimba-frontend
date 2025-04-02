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
}

export default function SO2Calculator({ inputs, startDateTime, endDateTime }: CalculatorProps) {
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

      // Define mapping of labels to max permissible SO2 values
      const maxPermissibleSO2: Record<string, number> = {
        'HG Biogas': 52.20,
        'Off Spec': 52.20,
        'Tox Flow': 55.16,
        'Maassen Flare': 27.14
      };

      // Shorten labels to first 2 words and add max permissible SO2 values
      var finalInputs = filteredInputs.map(item => {
        const words = item.label.split(' ');
        const shortenedLabel = words.slice(0, 2).join(' ');
        return {
          ...item,
          label: shortenedLabel,
          maxSO2: maxPermissibleSO2[shortenedLabel] || 0
        };
      });
      
      const totalFlowValue = finalInputs.reduce((sum, item) => sum + item.value, 0);  
      // Add the Total Flow item to the end of the list
      finalInputs.push({ 
        label: 'Total Flow', 
        value: totalFlowValue,
        maxSO2: 186.7 // Default max value for total flow
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
          Note: Permitted limit for HG Biogas decreases to 29.42 lbs/hr when only gas from Hoogland digester is flowing.
        </div>
      </CardFooter>
    </Card>
  );
}
