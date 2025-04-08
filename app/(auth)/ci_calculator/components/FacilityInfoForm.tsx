"use client";

import React from "react";
import { Info } from "lucide-react";
import { FacilityInfo, months } from "../page";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface FacilityInfoFormProps {
  facilityInfo: FacilityInfo;
  onChange: (facilityInfo: FacilityInfo) => void;
}

const FacilityInfoForm: React.FC<FacilityInfoFormProps> = ({ facilityInfo, onChange }) => {
  const handleChange = (field: keyof FacilityInfo, value: string | number) => {
    onChange({ ...facilityInfo, [field]: value });
  };

  return (
    <Card className="calculator-step">
      <div className="calculator-step-title">
        <span className="step-indicator">1</span>
        Applicant & Facility Information
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Enter your company name.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="companyName"
              placeholder="e.g. AgriBio Energy"
              value={facilityInfo.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
            <p className="input-hint">Enter your company name.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="facilityName">Facility Name</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Enter the name of your biogas facility.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="facilityName"
              placeholder="e.g. North Dairy Plant"
              value={facilityInfo.facilityName}
              onChange={(e) => handleChange("facilityName", e.target.value)}
            />
            <p className="input-hint">Enter the facility name.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="reportingMonth">Reporting Month</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Select the month for which you are reporting data.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={facilityInfo.reportingMonth}
              onValueChange={(value) => handleChange("reportingMonth", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="input-hint">Select the month for which you are reporting.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="digesterType">Digester Type</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">The digester type determines biogas collection efficiency (e.g., 95% for Covered Lagoon, 98% for Enclosed Vessel).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={facilityInfo.digesterType}
              onValueChange={(value) => handleChange("digesterType", value as "Covered Lagoon" | "Enclosed Vessel")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select digester type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Covered Lagoon">Covered Lagoon</SelectItem>
                <SelectItem value="Enclosed Vessel">Enclosed Vessel</SelectItem>
              </SelectContent>
            </Select>
            <p className="input-hint">Choose your digester type – determines biogas collection efficiency.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="digesterLocation">Digester Location</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Enter the physical location of your digester, which may influence regional emission factors.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="digesterLocation"
              placeholder="e.g. Iowa, USA"
              value={facilityInfo.digesterLocation}
              onChange={(e) => handleChange("digesterLocation", e.target.value)}
            />
            <p className="input-hint">Enter the physical location of your digester.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="avgAnnualTemperature">Average Annual Temperature (°C)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Temperature can influence baseline methane conversion and VS degradation rates. Warmer temperatures may increase methane production potential.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="avgAnnualTemperature"
              type="number"
              placeholder="e.g. 15"
              value={facilityInfo.avgAnnualTemperature.toString()}
              onChange={(e) => handleChange("avgAnnualTemperature", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Input the average temperature at your facility. Warmer temperatures may increase methane production potential.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FacilityInfoForm;
