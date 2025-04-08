"use client";

import React from "react";
import { Database } from "lucide-react";

interface CalculatorHeaderProps {
  onLoadSampleData: () => void;
}

const cardHeaderStyle = "bg-green-50 border-b";
const cardTitleStyle = "text-2xl text-green-800";

const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({ onLoadSampleData }) => {
  return (
    <div className="mb-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className={`flex flex-col space-y-1.5 p-6 ${cardHeaderStyle}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-2xl font-semibold leading-none tracking-tight ${cardTitleStyle}`}>
              Carbon Intensity Calculator
            </h3>
            <p className="text-sm text-muted-foreground text-green-700 mt-1">
              Calculate the Carbon Intensity (CI) score for renewable energy projects
            </p>
          </div>
          <button 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 flex items-center gap-2 bg-white"
            onClick={onLoadSampleData}
          >
            <Database className="h-4 w-4" />
            Load Sample Data
          </button>
        </div>
      </div>
      <div className="p-6 pt-0">
        <p className="text-muted-foreground">
          This calculator helps determine the carbon intensity of renewable energy projects 
          by analyzing various operational parameters. Complete all sections to generate a detailed CI result.
        </p>
      </div>
    </div>
  );
};

export default CalculatorHeader;