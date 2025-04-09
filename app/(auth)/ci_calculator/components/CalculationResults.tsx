"use client";

import React from "react";
import { CalculationResults as ResultsType } from "../page";

interface CalculationResultsProps {
  results: ResultsType | null;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="calculator-step">
        <div className="p-6">
          <h3 className="text-xl text-green-700 font-semibold">Results</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="text-center py-8 text-muted-foreground">
            Complete all required inputs and calculate to see results.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator-step">
      <div className="p-6">
        <h3 className="text-xl text-green-700 font-semibold">Carbon Intensity Results</h3>
      </div>
      <div className="p-6 pt-0 space-y-6">
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
        
        <hr className="h-[1px] w-full shrink-0 bg-border" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add result metrics here */}
        </div>
      </div>
    </div>
  );
};

export default CalculationResults;