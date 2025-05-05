
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LivestockData } from "./lib/calculator-types";
import { Info, Plus, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LivestockDataFormProps {
  livestockData: LivestockData;
  onChange: (livestockData: LivestockData) => void;
}

const LivestockDataForm: React.FC<LivestockDataFormProps> = ({ livestockData, onChange }) => {
  const handleChange = (field: keyof LivestockData, value: string | number) => {
    onChange({ ...livestockData, [field]: value });
  };

  const handleArrayChange = (
    field: keyof LivestockData,
    index: number,
    subField: string,
    value: number
  ) => {
    if (field === "populationCalendarDays") {
      const newArray = [...livestockData.populationCalendarDays];
      newArray[index] = {
        ...newArray[index],
        [subField]: value
      };
      onChange({ ...livestockData, populationCalendarDays: newArray });
    }
  };

  const addPopulationCalendarDay = () => {
    const newArray = [...livestockData.populationCalendarDays, { population: 0, days: 0 }];
    onChange({ ...livestockData, populationCalendarDays: newArray });
  };

  const removePopulationCalendarDay = (index: number) => {
    const newArray = [...livestockData.populationCalendarDays];
    newArray.splice(index, 1);
    onChange({ ...livestockData, populationCalendarDays: newArray });
  };

  return (
    <Card className="p-4">
      <div className="font-medium text-green-800 text-xl mb-4">
        
        Livestock & Feedstock Data
      </div>
      
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-green-700">Livestock Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="livestockType">Type of Livestock</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Different livestock types have different methane production potentials and VS excretion rates.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={livestockData.livestockType}
              onValueChange={(value) => handleChange("livestockType", value as "Dairy" | "Swine")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select livestock type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Swine">Swine</SelectItem>
              </SelectContent>
            </Select>
            <p className="input-hint">Select the type of livestock.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="numberOfAnimals">Number of Animals</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">This value is used to scale the baseline emissions calculation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="numberOfAnimals"
              type="number"
              placeholder="e.g. 1000"
              value={livestockData.numberOfAnimals.toString()}
              onChange={(e) => handleChange("numberOfAnimals", parseInt(e.target.value) || 0)}
            />
            <p className="input-hint">Enter the total number of animals.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="baselineManureSystem">Baseline Manure Management System</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Different manure management systems have different methane conversion factors (MCF).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={livestockData.baselineManureSystem}
              onValueChange={(value) => handleChange("baselineManureSystem", value as "Open Lagoon" | "Storage Pit/Basin" | "Daily Spread/Dry Lot")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select manure system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open Lagoon">Open Lagoon</SelectItem>
                <SelectItem value="Storage Pit/Basin">Storage Pit/Basin</SelectItem>
                <SelectItem value="Daily Spread/Dry Lot">Daily Spread/Dry Lot</SelectItem>
              </SelectContent>
            </Select>
            <p className="input-hint">Select the manure handling method.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="retentionTimeNotes">Retention Time & Drainage Details (Optional)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">This information may be useful for understanding your system performance.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="retentionTimeNotes"
              placeholder="Optional: Provide any additional details about retention time or drainage"
              value={livestockData.retentionTimeNotes}
              onChange={(e) => handleChange("retentionTimeNotes", e.target.value)}
            />
            <p className="input-hint">Provide any notes on how often the system is emptied or specific drainage details.</p>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-green-700 mt-6">Feedstock Data</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Livestock Population & Calendar Days</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Enter population counts and days for each category of livestock.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addPopulationCalendarDay}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </div>
          
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Population</TableHead>
                  <TableHead>Calendar Days</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {livestockData.populationCalendarDays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No data added. Click "Add Row" to begin.
                    </TableCell>
                  </TableRow>
                ) : (
                  livestockData.populationCalendarDays.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.population.toString()}
                          onChange={(e) => handleArrayChange("populationCalendarDays", index, "population", parseInt(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.days.toString()}
                          onChange={(e) => handleArrayChange("populationCalendarDays", index, "days", parseInt(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removePopulationCalendarDay(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="reportingDays">Number of Reporting Days (RDrm)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Enter the number of days during which manure is collected.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="reportingDays"
              type="number"
              placeholder="e.g. 30"
              value={livestockData.reportingDays.toString()}
              onChange={(e) => handleChange("reportingDays", parseInt(e.target.value) || 0)}
            />
            <p className="input-hint">Enter the number of days during which manure is collected.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="avgStorageTemperature">Average Temperature (°C) of Manure Storage</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Temperature affects methane conversion rates in manure storage.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="avgStorageTemperature"
              type="number"
              placeholder="e.g. 20"
              value={livestockData.avgStorageTemperature.toString()}
              onChange={(e) => handleChange("avgStorageTemperature", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Input average temperature from storage.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="fractionVS">Fraction of Volatile Solids (VS) Sent to Anaerobic Storage</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60">Enter as a decimal (e.g., 0.8 for 80%).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="fractionVS"
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="e.g. 0.8"
              value={livestockData.fractionVS.toString()}
              onChange={(e) => handleChange("fractionVS", parseFloat(e.target.value) || 0)}
            />
            <p className="input-hint">Enter the fraction (as a decimal) of VS that goes into storage.</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="carryoverFromPreviousMonth">Carryover from Previous Month (kg, if applicable)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-60">Enter any carryover material from previous reporting periods.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="carryoverFromPreviousMonth"
            type="number"
            placeholder="e.g. 0"
            value={livestockData.carryoverFromPreviousMonth.toString()}
            onChange={(e) => handleChange("carryoverFromPreviousMonth", parseFloat(e.target.value) || 0)}
          />
          <p className="input-hint">Input the amount (in kg) carried over from the previous period.</p>
        </div>
      </div>
    </Card>
  );
};

export default LivestockDataForm;