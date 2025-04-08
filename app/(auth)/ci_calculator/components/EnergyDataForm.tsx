"use client";
import { EnergyData } from "../page";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EnergyDataFormProps {
  energyData: EnergyData;
  onChange: (energyData: EnergyData) => void;
}

const EnergyDataForm: React.FC<EnergyDataFormProps> = ({ energyData, onChange }) => {
  const handleChange = (field: keyof EnergyData, value: number) => {
    onChange({ ...energyData, [field]: value });
  };

  return (
    <Card className="calculator-step">
      <div className="calculator-step-title">
        <span className="step-indicator">5</span>
        Energy & Fuel Inputs
      </div>
      
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Enter energy consumption data for baseline operations, anaerobic digestion, upgrading/compression, and transport. 
          These inputs are grouped by process steps.
        </p>
        
        <div>
          <h3 className="text-md font-semibold text-green-700 mb-3">A. Baseline Energy Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="baselineDieselConsumption">Baseline Diesel Consumption (Gallons)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Diesel used for manure transport/handling in baseline scenario.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="baselineDieselConsumption"
                type="number"
                placeholder="e.g. 100"
                value={energyData.baselineDieselConsumption.toString()}
                onChange={(e) => handleChange("baselineDieselConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">For manure transport/handling.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="baselineNaturalGasConsumption">Baseline Natural Gas Consumption (MMBtu)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Natural gas used in baseline operations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="baselineNaturalGasConsumption"
                type="number"
                placeholder="e.g. 50"
                value={energyData.baselineNaturalGasConsumption.toString()}
                onChange={(e) => handleChange("baselineNaturalGasConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">If used in baseline operations.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="baselineElectricityConsumption">Baseline Electricity Consumption (kWh)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Electricity used for pumping or manure processing in baseline scenario.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="baselineElectricityConsumption"
                type="number"
                placeholder="e.g. 1000"
                value={energyData.baselineElectricityConsumption.toString()}
                onChange={(e) => handleChange("baselineElectricityConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">E.g., for pumping or manure processing.</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-md font-semibold text-green-700 mb-3">B. Digester Energy Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="digesterBiogasConsumption">Digester Biogas Consumption (scf)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Biogas used to heat the digester.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="digesterBiogasConsumption"
                type="number"
                placeholder="e.g. 25000"
                value={energyData.digesterBiogasConsumption.toString()}
                onChange={(e) => handleChange("digesterBiogasConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Input the biogas used for digester heating.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="digesterNaturalGasConsumption">Digester Natural Gas Consumption (MMBtu)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Natural gas used for digester heating.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="digesterNaturalGasConsumption"
                type="number"
                placeholder="e.g. 20"
                value={energyData.digesterNaturalGasConsumption.toString()}
                onChange={(e) => handleChange("digesterNaturalGasConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Input natural gas consumption for the digester.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="digesterElectricityConsumption">Digester Electricity Consumption (kWh)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Electricity used for mixing, pumping, and controls.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="digesterElectricityConsumption"
                type="number"
                placeholder="e.g. 5000"
                value={energyData.digesterElectricityConsumption.toString()}
                onChange={(e) => handleChange("digesterElectricityConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Electricity for digester operations.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="digesterDieselConsumption">Digester Diesel Consumption (Gallons)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Diesel used for equipment related to digester operations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="digesterDieselConsumption"
                type="number"
                placeholder="e.g. 50"
                value={energyData.digesterDieselConsumption.toString()}
                onChange={(e) => handleChange("digesterDieselConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Diesel for equipment related to digestion.</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-md font-semibold text-green-700 mb-3">C. Upgrading & Compression Energy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="upgradingNaturalGasConsumption">Upgrading Natural Gas Consumption (MMBtu)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Natural gas used in upgrading process.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="upgradingNaturalGasConsumption"
                type="number"
                placeholder="e.g. 15"
                value={energyData.upgradingNaturalGasConsumption.toString()}
                onChange={(e) => handleChange("upgradingNaturalGasConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Natural gas consumption for upgrading.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="upgradingBiogasConsumption">Upgrading Biogas Consumption (scf)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Biogas used to power upgrading operations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="upgradingBiogasConsumption"
                type="number"
                placeholder="e.g. 10000"
                value={energyData.upgradingBiogasConsumption.toString()}
                onChange={(e) => handleChange("upgradingBiogasConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Biogas used for upgrading operations.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="upgradingElectricityConsumption">Upgrading Electricity Consumption (kWh)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Electricity for upgrading technology (PSA, membranes, etc.).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="upgradingElectricityConsumption"
                type="number"
                placeholder="e.g. 8000"
                value={energyData.upgradingElectricityConsumption.toString()}
                onChange={(e) => handleChange("upgradingElectricityConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Electricity for upgrading and compression.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="upgradingDieselConsumption">Upgrading Diesel Consumption (Gallons)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Diesel used for equipment related to upgrading.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="upgradingDieselConsumption"
                type="number"
                placeholder="e.g. 30"
                value={energyData.upgradingDieselConsumption.toString()}
                onChange={(e) => handleChange("upgradingDieselConsumption", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Diesel for equipment related to upgrading.</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-md font-semibold text-green-700 mb-3">D. Biomethane Transport & Tail Gas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="biomethaneTailGasFlow">Biomethane Tail Gas Flow (scf)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Offgas from upgrading process, which may contain some methane.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="biomethaneTailGasFlow"
                type="number"
                placeholder="e.g. 5000"
                value={energyData.biomethaneTailGasFlow.toString()}
                onChange={(e) => handleChange("biomethaneTailGasFlow", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Flow of tail gas from upgrading process.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="tailGasMethaneContent">Tail Gas Methane Content (%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Methane slip in tail gas, typically 1-3% depending on technology.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="tailGasMethaneContent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 2"
                value={energyData.tailGasMethaneContent.toString()}
                onChange={(e) => handleChange("tailGasMethaneContent", parseFloat(e.target.value) || 0)}
              />
              <p className="input-hint">Percentage of methane in tail gas.</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnergyDataForm;


