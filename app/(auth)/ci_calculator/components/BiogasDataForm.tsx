"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { BiogasData } from "../page";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BiogasDataFormProps {
  biogasData: BiogasData;
  onChange: (biogasData: BiogasData) => void;
}

const BiogasDataForm: React.FC<BiogasDataFormProps> = ({ biogasData, onChange }) => {
  const handleChange = (field: keyof BiogasData, value: number) => {
    onChange({ ...biogasData, [field]: value });
  };

  return (
    <Card className="calculator-step">
      <div className="calculator-step-title">
        <span className="step-indicator">4</span>
        Biogas & Upgrading Inputs
      </div>
      
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Quantify your biogas production, its methane content, and upgrading performance to determine 
          the availability and quality of biogas for conversion into biomethane.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="rawBiogasFlow">Raw Biogas Flow (scf/month)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Total biogas produced before any utilization or processing.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="rawBiogasFlow"
              type="number"
              placeholder="e.g. 1000000"
              value={biogasData.rawBiogasFlow.toString()}
              onChange={(e) => handleChange("rawBiogasFlow", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Enter the monthly flow rate of raw biogas.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="rawBiogasMethaneContent">Raw Biogas Methane Content (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Typical values range from 55-65% for agricultural digesters.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="rawBiogasMethaneContent"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 60"
              value={biogasData.rawBiogasMethaneContent.toString()}
              onChange={(e) => handleChange("rawBiogasMethaneContent", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Input the methane concentration in raw biogas.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="flaredBiogasFlow">Flared Biogas Flow (scf/month)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Amount of biogas sent to flare rather than utilized.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="flaredBiogasFlow"
              type="number"
              placeholder="e.g. 50000"
              value={biogasData.flaredBiogasFlow.toString()}
              onChange={(e) => handleChange("flaredBiogasFlow", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Enter the monthly flow rate of biogas that is flared.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="flaredBiogasMethaneContent">Flared Biogas Methane Content (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Usually similar to raw biogas methane content.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="flaredBiogasMethaneContent"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 60"
              value={biogasData.flaredBiogasMethaneContent.toString()}
              onChange={(e) => handleChange("flaredBiogasMethaneContent", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Input the methane concentration in the flared biogas.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="biogasToUpgrading">Biogas to Upgrading (scf/month)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Amount of biogas sent to upgrading to biomethane.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="biogasToUpgrading"
              type="number"
              placeholder="e.g. 950000"
              value={biogasData.biogasToUpgrading.toString()}
              onChange={(e) => handleChange("biogasToUpgrading", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Enter the monthly biogas flow directed to the upgrading process.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="upgradingFeedstockMethane">Upgrading Feedstock Methane (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Methane content in the biogas sent to upgrading.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="upgradingFeedstockMethane"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 60"
              value={biogasData.upgradingFeedstockMethane.toString()}
              onChange={(e) => handleChange("upgradingFeedstockMethane", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Input the methane concentration in the feedstock sent to upgrading.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BiogasDataForm;
