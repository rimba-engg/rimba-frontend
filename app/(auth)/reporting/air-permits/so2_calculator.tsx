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
  const [results, setResults] = useState<Record<string, { result1: number; result2: number }>>({});
  console.log(startDateTime, endDateTime)

  const totalHours = DateTime.fromISO(endDateTime).diff(DateTime.fromISO(startDateTime), 'hours').hours;

  console.log(totalHours)

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
    const newResults: Record<string, { result1: number; result2: number }> = {};
    
    inputs.forEach(({ label, value }) => {
      const userValue = parseFloat(userInputs[label] || '0');
      
      // Formula 1: Multiply the user input by the predefined value
      const result1 = ((userValue * (value/totalHours)) / 1000000) *  0.16;
      
      // Formula 2: Square the user input and multiply by the predefined value
      const result2 = result1 * totalHours;
      
      newResults[label] = { result1, result2 };
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
          <div className="grid grid-cols-4 gap-2 items-center font-semibold mb-2 border-b pb-2">
            <div>Source</div>
            <div>H2S Input (ppm)</div>
            <div>Hourly average SO2 </div>
            <div>Total SO2</div>
          </div>
          {inputs.map(({ label, value }) => (
            <div key={label} className="grid grid-cols-4 gap-2 items-center">
              <div className="font-medium">{label.split(' ').slice(0, 2).join(' ')}</div>
              <Input
                type="number"
                placeholder="H2S (ppm)"
                value={userInputs[label] || ''}
                onChange={(e) => handleInputChange(label, e.target.value)}
              />
              {results[label] ? (
                <>
                  <div className="text-sm flex flex-row items-center ">
                    {results[label].result1.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    {results[label].result2.toFixed(2)}
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
      <CardFooter>
        <Button onClick={calculateResults} className="w-full">Calculate</Button>
      </CardFooter>
    </Card>
  );
}
