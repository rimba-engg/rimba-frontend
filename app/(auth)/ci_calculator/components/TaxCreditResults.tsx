
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalculationResults } from "./lib/calculator-types";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaxCreditResultsProps {
  results: CalculationResults | null;
  biomethaneProduced: number; // In MMBtu
}

const TaxCreditResults: React.FC<TaxCreditResultsProps> = ({ results, biomethaneProduced }) => {
  const [wageRequirementsMet, setWageRequirementsMet] = useState<boolean>(false);
  const [fuelType, setFuelType] = useState<string>("standard");

  if (!results) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-xl text-green-700">Tax Credit Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Complete all required inputs and calculate CI first to see tax credit results.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert g CO2e/MJ to kg CO2e/MMBtu for tax credit calculation
  // 1 MMBtu = 1055.06 MJ, and g to kg conversion (÷ 1000)
  const ciInTaxCreditUnits = results.totalCarbonIntensity * 1055.06 / 1000;

  // Determine base payment rate based on fuel type and compliance status
  let basePaymentRate = 0.20; // Default for standard fuels
  if (fuelType === "saf") {
    basePaymentRate = 0.35; // Higher rate for sustainable aviation fuels
  }
  
  // Apply multiplier if wage requirements are met
  if (wageRequirementsMet) {
    basePaymentRate = fuelType === "saf" ? 1.75 : 1.00;
  }

  // Calculate credit using the formula: Credit Value ($/ton) = Base Payment Rate × [1 – (CI / 50)]
  const calculationValue = Math.max(0, 1 - (ciInTaxCreditUnits / 50));
  const creditPerMMBtu = basePaymentRate * calculationValue;
  
  // Calculate total credit
  const totalCredit = creditPerMMBtu * biomethaneProduced;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="text-xl text-green-700">Inflation Reduction Act Tax Credit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Tax Credit Formula</h3>
          <p className="text-sm text-blue-700">
            Credit Value ($/MMBtu) = Base Payment Rate × [1 – (CI / 50)]
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Where CI is in kg CO₂e/MMBtu and fuels with CI ≥ 50 kg CO₂e/MMBtu receive no credit.
            Lower CI values earn a proportionally higher credit.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Different fuel types have different base payment rates.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                value={fuelType}
                onValueChange={setFuelType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Clean Fuel</SelectItem>
                  <SelectItem value="saf">Sustainable Aviation Fuel (SAF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="wageRequirements">Wage & Apprenticeship Requirements Met</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Meeting these requirements increases the base payment rate.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                value={wageRequirementsMet ? "yes" : "no"}
                onValueChange={(value) => setWageRequirementsMet(value === "yes")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Carbon Intensity (CI)</Label>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg">{results.totalCarbonIntensity.toFixed(2)}</span>
                <span className="text-muted-foreground">g CO₂e/MJ</span>
                <span className="mx-2">=</span>
                <span className="font-semibold text-lg">{ciInTaxCreditUnits.toFixed(2)}</span>
                <span className="text-muted-foreground">kg CO₂e/MMBtu</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label>Base Payment Rate</Label>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg">${basePaymentRate.toFixed(2)}</span>
                <span className="text-muted-foreground">per MMBtu</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label>Calculation Value [1 – (CI / 50)]</Label>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg">{calculationValue.toFixed(4)}</span>
                {ciInTaxCreditUnits >= 50 && (
                  <span className="text-destructive">(No credit - CI exceeds threshold)</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="result-card">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Tax Credit Results</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Credit per MMBtu:</span>
              <span className="font-mono font-semibold text-xl">
                ${creditPerMMBtu.toFixed(4)}/MMBtu
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Total Biomethane Produced:</span>
              <span className="font-mono font-semibold text-xl">
                {biomethaneProduced.toLocaleString()} MMBtu
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t pt-2">
              <span>Estimated Total Tax Credit:</span>
              <span className="font-mono font-bold text-2xl text-green-700">
                ${totalCredit.toLocaleString(undefined, {maximumFractionDigits: 2})}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-green-600 mt-4">
            This is an estimate based on the current IRA tax credit formula. Consult with a tax professional for confirmation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxCreditResults;