
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FuelProduced } from "./lib/calculator-types";  
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FuelProducedFormProps {
  fuelProduced: FuelProduced;
  onChange: (fuelProduced: FuelProduced) => void;
}

const FuelProducedForm: React.FC<FuelProducedFormProps> = ({ fuelProduced, onChange }) => {
  const handleChange = (field: keyof FuelProduced, value: number) => {
    onChange({ ...fuelProduced, [field]: value });
  };

  return (
    <Card className="p-4">
      <div className="font-medium text-green-800 text-xl mb-4">
        
        Final Fuel Produced
      </div>
      
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Specify the useful energy outputs and any on-site energy credits. The biomethane injected value 
          is particularly important as it's the denominator for emissions per MJ.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="biomethaneInjected">Biomethane Injected (MMBtu)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">This is the denominator for emissions per MJ in the final CI calculation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="biomethaneInjected"
              type="number"
              placeholder="e.g. 1000"
              value={fuelProduced.biomethaneInjected.toString()}
              onChange={(e) => handleChange("biomethaneInjected", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Enter the total annual energy content of the biomethane produced.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="electricityProducedOnsite">Electricity Produced On-site/Exported (kWh)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Any electricity generated on-site that offsets grid consumption.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="electricityProducedOnsite"
              type="number"
              placeholder="e.g. 2000"
              value={fuelProduced.electricityProducedOnsite.toString()}
              onChange={(e) => handleChange("electricityProducedOnsite", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Electricity generated on-site or exported to grid.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="distanceToCNG">Distance to CNG/LNG Stations (miles)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Transportation distance affects transport-related emissions.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="distanceToCNG"
              type="number"
              placeholder="e.g. 50"
              value={fuelProduced.distanceToCNG.toString()}
              onChange={(e) => handleChange("distanceToCNG", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Average transportation distance to fueling stations.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="percentCNGtoLNG">% CNG Converted to LNG</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">LNG conversion adds additional energy intensity to the pathway.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="percentCNGtoLNG"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 20"
              value={fuelProduced.percentCNGtoLNG.toString()}
              onChange={(e) => handleChange("percentCNGtoLNG", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Percentage of biomethane converted to LNG.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FuelProducedForm;