"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ElectricityInfo } from "../page";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { electricityMixOptions } from "./lib/constants";
interface ElectricityInfoFormProps {
  electricityInfo: ElectricityInfo;
  onChange: (electricityInfo: ElectricityInfo) => void;
}

const ElectricityInfoForm: React.FC<ElectricityInfoFormProps> = ({ electricityInfo, onChange }) => {
  const handleElectricityMixChange = (value: string) => {
    const selectedMix = electricityMixOptions.find(mix => mix.value === value);
    
    if (selectedMix) {
      onChange({
        electricityMix: value,
        efElec: selectedMix.emissionFactor
      });
    }
  };

  return (
    <Card className="calculator-step">
      <div className="calculator-step-title">
        <span className="step-indicator">2</span>
        Electricity Mix Selection
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="electricityMix">Select Electricity Mix</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-60">This selection sets the EF₍elec₎ value in g CO₂e/kWh, which affects the electricity-related emissions calculation.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            value={electricityInfo.electricityMix}
            onValueChange={handleElectricityMixChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select electricity mix" />
            </SelectTrigger>
            <SelectContent>
              {electricityMixOptions.map((mix) => (
                <SelectItem key={mix.value} value={mix.value}>
                  {mix.label} ({mix.emissionFactor} g CO₂e/kWh)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="input-hint">Choose the regional electricity mix that applies to your facility. Different mixes affect the overall emissions calculation.</p>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Selected Emission Factor</h4>
          <p className="text-blue-700">
            Your selected electricity mix ({electricityInfo.electricityMix}) has an emission factor of:
            <span className="font-bold ml-1">{electricityInfo.efElec} g CO₂e/kWh</span>
          </p>
          <p className="text-sm text-blue-600 mt-2">
            This value will be used in the calculation of electricity-related emissions throughout the assessment.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ElectricityInfoForm;
