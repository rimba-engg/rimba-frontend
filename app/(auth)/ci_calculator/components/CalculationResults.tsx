
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalculationResults as ResultsType } from "./lib/calculator-types";

interface CalculationResultsProps {
  results: ResultsType | null;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({ results }) => {
  if (!results) {
    return (
      <Card className="calculator-step">
        <CardHeader>
          <CardTitle className="text-xl text-green-700">Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Complete all required inputs and calculate to see results.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="calculator-step">
      <CardHeader>
        <CardTitle className="text-xl text-green-700">Carbon Intensity Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="result-card">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Final Carbon Intensity (CI)</h3>
          <div className="flex items-center justify-between">
            <span>Total Carbon Intensity:</span>
            <span className="result-value">
              {results.totalCarbonIntensity.toFixed(2)} g CO₂e/MJ
            </span>
          </div>
          <p className="text-sm text-green-600 mt-2">
            This is the final CI score for your biomethane pathway, accounting for both emissions and avoided methane credits.
          </p>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-semibold text-blue-700 mb-3">Methane Emissions</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Baseline Methane Emissions:</span>
                <span className="font-semibold">
                  {results.baselineMethaneEmissions.toFixed(2)} kg CH₄
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Project Methane Emissions:</span>
                <span className="font-semibold">
                  {results.projectMethaneEmissions.toFixed(2)} kg CH₄
                </span>
              </div>
              
              <div className="flex items-center justify-between border-t pt-1">
                <span className="text-sm">Net Methane Avoided:</span>
                <span className="font-semibold text-green-600">
                  {results.netMethaneAvoided.toFixed(2)} kg CH₄
                </span>
              </div>
              
              <div className="flex items-center justify-between bg-green-50 p-2 rounded-md">
                <span className="text-sm">Avoided Methane Credit:</span>
                <span className="font-semibold text-green-600">
                  -{results.avoidedMethaneCredit.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-blue-700 mb-3">Energy-Related Emissions</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Electricity Emissions:</span>
                <span className="font-semibold">
                  {results.electricityEmissions.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Natural Gas Emissions:</span>
                <span className="font-semibold">
                  {results.naturalGasEmissions.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Diesel Emissions:</span>
                <span className="font-semibold">
                  {results.dieselEmissions.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Fugitive Emissions:</span>
                <span className="font-semibold">
                  {results.fugitiveEmissions.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-semibold text-blue-700 mb-3">Transport & Tailpipe Emissions</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Transport Emissions:</span>
                <span className="font-semibold">
                  {results.transportEmissions.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Tailpipe Emissions:</span>
                <span className="font-semibold">
                  {results.tailpipeEmissions.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-blue-700 mb-3">CI Breakdown</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Positive Emissions:</span>
                <span className="font-semibold">
                  {(
                    results.electricityEmissions +
                    results.naturalGasEmissions +
                    results.dieselEmissions +
                    results.fugitiveEmissions +
                    results.tailpipeEmissions +
                    results.transportEmissions
                  ).toFixed(2)} g CO₂e/MJ
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Credits:</span>
                <span className="font-semibold text-green-600">
                  -{results.avoidedMethaneCredit.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
              
              <div className="flex items-center justify-between border-t pt-1">
                <span className="text-sm">Net Carbon Intensity:</span>
                <span className="font-semibold">
                  {results.totalCarbonIntensity.toFixed(2)} g CO₂e/MJ
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationResults;