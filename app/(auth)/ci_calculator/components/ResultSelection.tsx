
import React from "react";
import { Button } from "@/components/ui/button";
import CalculationResults from "./CalculationResults";
import TaxCreditResults from "./TaxCreditResults";
import ResultsCharts from "./ResultsCharts";
import { CalculationResults as CalculationResultsType } from "./lib/calculator-types";

interface ResultsSectionProps {
  results: CalculationResultsType | null;
  biomethaneProduced: number;
  onBack: () => void;
  onRecalculate: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  results,
  biomethaneProduced,
  onBack,
  onRecalculate
}) => {
  if (!results) {
    return <div>No results available. Please calculate first.</div>;
  }

  return (
    <div>
      <CalculationResults results={results} />
      <TaxCreditResults 
        results={results} 
        biomethaneProduced={biomethaneProduced} 
      />
      <ResultsCharts results={results} />
      
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="mr-2"
        >
          Back to Input
        </Button>
        <Button
          onClick={onRecalculate}
          className="bg-green-600 hover:bg-green-700"
        >
          Recalculate
        </Button>
      </div>
    </div>
  );
};

export default ResultsSection;