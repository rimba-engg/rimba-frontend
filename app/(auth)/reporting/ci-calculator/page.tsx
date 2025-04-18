"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, BASE_URL, defaultHeaders } from "@/lib/api";

interface SummaryResults {
  "Applicant": string;
  "Digester Location": string;
  "Manure Biogas Production Electricity Mix": string;
  "Carbon Intensity from Inputs (gCO2e/MJ)": number;
  "Total Carbon Intensity from Inputs (gCO2e/MJ)": number;
  "L-CNG and CNG Production (MMBtu)": number;
  "CNG Vehicle Emissions CI, gCO2e/MMBtu": number;
  "CNG Vehicle Emissions CI, gCO2e/MJ": number;
  "LNG Vehicle Emissions CI, gCO2e/MMBtu": number;
  "LNG Vehicle Emissions CI, gCO2e/MJ": number;
  "Methan Avoided, gCO2e/MJ": number;
  "CO2 Diverted, gCO2e/MJ": number;
  "Final CNG CI, g/MJ ": number;
  "Final LNG CI, g/MJ": number;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    execution_time_seconds: number;
    memory_usage_mb: number;
    summary_results: SummaryResults;
  };
}

export default function CICalculatorPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [calculatorData, setCalculatorData] = useState<SummaryResults | null>(null);

  const fetchCalculatorData = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<ApiResponse>('v2/ci-calculator/', {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      });
      const data = response.data;
      setCalculatorData(data.summary_results);
    } catch (error) {
      console.error("Error fetching calculator data:", error);
      alert("Failed to fetch calculator data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCalculator = async () => {
    if (!startDate || !endDate) {
      alert("Please calculate CI data before downloading");
      return;
    }

    setIsDownloading(true);
    try {
      // Fixed double slash in URL and use api utility with default headers
      const url = `${BASE_URL}/v2/ci-calculator/download/`;
      const uploadHeaders = { ...defaultHeaders } as Record<string, string>;
      // Set the correct Content-Type for JSON data
      uploadHeaders['Content-Type'] = 'application/json';
      
      // Use fetch with proper headers
      const response = await fetch(url, {
        method: 'POST',
        headers: uploadHeaders,
        body: JSON.stringify({
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link for the blob
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `ci-calculator-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading calculator data:", error);
      alert("Failed to download calculator data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Carbon Intensity Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Date Range Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={fetchCalculatorData} 
                  disabled={isLoading || !startDate || !endDate}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate CI"
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={downloadCalculator}
                  disabled={isDownloading || !startDate || !endDate}
                  className="flex-1"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Calculator
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {calculatorData && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Execution Time:</span>
                  <span className="text-sm">{calculatorData.execution_time_seconds.toFixed(2)} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Memory Usage:</span>
                  <span className="text-sm">{calculatorData.data.memory_usage_mb.toFixed(2)} MB</span>
                </div>
              </div> */}
            </CardContent>
          </Card>
        )}
      </div>
      
      {calculatorData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Applicant:</span>
                    <span className="text-lg">{calculatorData.Applicant}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Digester Location:</span>
                    <span className="text-lg">{calculatorData["Digester Location"]}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Electricity Mix:</span>
                    <span className="text-lg">{calculatorData["Manure Biogas Production Electricity Mix"]}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Production:</span>
                    <span className="text-lg">{calculatorData["L-CNG and CNG Production (MMBtu)"].toFixed(2)} MMBtu</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CNG Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Vehicle Emissions (gCO2e/MMBtu):</span>
                    <span className="text-2xl font-bold">{calculatorData["CNG Vehicle Emissions CI, gCO2e/MMBtu"].toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Vehicle Emissions (gCO2e/MJ):</span>
                    <span className="text-2xl font-bold">{calculatorData["CNG Vehicle Emissions CI, gCO2e/MJ"].toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Final CI (g/MJ):</span>
                    <span className="text-3xl font-bold text-green-600">{calculatorData["Final CNG CI, g/MJ "].toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>LNG Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Vehicle Emissions (gCO2e/MMBtu):</span>
                    <span className="text-2xl font-bold">{calculatorData["LNG Vehicle Emissions CI, gCO2e/MMBtu"].toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Vehicle Emissions (gCO2e/MJ):</span>
                    <span className="text-2xl font-bold">{calculatorData["LNG Vehicle Emissions CI, gCO2e/MJ"].toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Final CI (g/MJ):</span>
                    <span className="text-3xl font-bold text-blue-600">{calculatorData["Final LNG CI, g/MJ"].toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Carbon Intensity Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Carbon Intensity from Inputs (gCO2e/MJ):</span>
                    <span className="text-xl">{calculatorData["Carbon Intensity from Inputs (gCO2e/MJ)"].toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Total Carbon Intensity from Inputs (gCO2e/MJ):</span>
                    <span className="text-xl">{calculatorData["Total Carbon Intensity from Inputs (gCO2e/MJ)"].toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Methane Avoided (gCO2e/MJ):</span>
                    <span className="text-xl">{calculatorData["Methan Avoided, gCO2e/MJ"].toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">CO2 Diverted (gCO2e/MJ):</span>
                    <span className="text-xl">{calculatorData["CO2 Diverted, gCO2e/MJ"].toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
