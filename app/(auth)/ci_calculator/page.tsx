"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FileText, Calculator, Info } from "lucide-react";

import StepIndicator from "./components/StepIndicator";
import CalculatorHeader from "./components/CalculatorHeader";
import FacilityInfoForm from "./components/FacilityInfoForm";
import ElectricityInfoForm from "./components/ElectricityInfoForm";
import LivestockDataForm from "./components/LivestockDataForm";
import BiogasDataForm from "./components/BiogasDataForm";
import EnergyDataForm from "./components/EnergyDataForm";
import FuelProducedForm from "./components/FuelProducedForm";
import CalculationResults from "./components/CalculationResults";
import TaxCreditResults from "./components/TaxCreditResults";
import ResultsCharts from "./components/ResultsCharts";
import FormulaExplanation from "./components/FormulaExplanation";
// Import the Button, ArrowLeft, and ArrowRight components from their new location
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { defaultCalculatorState ,sampleData, calculateTotalCarbonIntensity} from "./components/lib/constants";

// Types
export interface FacilityInfo {
  companyName: string;
  facilityName: string;
  reportingMonth: string;
  digesterType: "Covered Lagoon" | "Enclosed Vessel";
  digesterLocation: string;
  avgAnnualTemperature: number;
}

export interface ElectricityInfo {
  electricityMix: string;
  efElec: number;
}

export interface PopulationCalendarDay {
  population: number;
  days: number;
}

export interface LivestockData {
  livestockType: "Dairy" | "Swine";
  numberOfAnimals: number;
  baselineManureSystem: "Open Lagoon" | "Storage Pit/Basin" | "Daily Spread/Dry Lot";
  retentionTimeNotes: string;
  populationCalendarDays: PopulationCalendarDay[];
  reportingDays: number;
  avgStorageTemperature: number;
  fractionVS: number;
  carryoverFromPreviousMonth: number;
}

export interface BiogasData {
  rawBiogasFlow: number;
  rawBiogasMethaneContent: number;
  flaredBiogasFlow: number;
  flaredBiogasMethaneContent: number;
  biogasToUpgrading: number;
  upgradingFeedstockMethane: number;
}

export interface EnergyData {
  baselineDieselConsumption: number;
  baselineNaturalGasConsumption: number;
  baselineElectricityConsumption: number;
  digesterBiogasConsumption: number;
  digesterNaturalGasConsumption: number;
  digesterElectricityConsumption: number;
  digesterDieselConsumption: number;
  upgradingNaturalGasConsumption: number;
  upgradingBiogasConsumption: number;
  upgradingElectricityConsumption: number;
  upgradingDieselConsumption: number;
  biomethaneTailGasFlow: number;
  tailGasMethaneContent: number;
}

export interface FuelProduced {
  biomethaneInjected: number;
  electricityProducedOnsite: number;
  distanceToCNG: number;
  percentCNGtoLNG: number;
}

export interface CalculationResults {
  baselineMethaneEmissions: number;
  projectMethaneEmissions: number;
  netMethaneAvoided: number;
  avoidedMethaneCredit: number;
  electricityEmissions: number;
  naturalGasEmissions: number;
  dieselEmissions: number;
  fugitiveEmissions: number;
  transportEmissions: number;
  tailpipeEmissions: number;
  totalCarbonIntensity: number;
}

export interface CalculatorState {
  facilityInfo: FacilityInfo;
  electricityInfo: ElectricityInfo;
  livestockData: LivestockData;
  biogasData: BiogasData;
  energyData: EnergyData;
  fuelProduced: FuelProduced;
  results: CalculationResults | null;
  currentStep: number;
}

// Utility functions

// Main Page Component
export default function CICalculatorPage() {
  const [state, setState] = useState<CalculatorState>(defaultCalculatorState);
  const [activeTab, setActiveTab] = useState<string>("input");

  const handleStepChange = (step: number) => {
    setState({ ...state, currentStep: step });
  };

  const handleCalculate = () => {
    try {
      if (state.fuelProduced.biomethaneInjected <= 0) {
        toast({
          title: "Missing Required Input",
          description: "Please enter a value for Biomethane Injected",
          variant: "destructive",
        });
        return;
      }

      if (state.livestockData.numberOfAnimals <= 0) {
        toast({
          title: "Missing Required Input",
          description: "Please enter the number of animals",
          variant: "destructive",
        });
        return;
      }

      const results = calculateTotalCarbonIntensity(
        state.facilityInfo,
        state.electricityInfo,
        state.livestockData,
        state.biogasData,
        state.energyData,
        state.fuelProduced
      );

      setState({ ...state, results });
      setActiveTab("results");
      
      toast({
        title: "Calculation Complete",
        description: "Carbon Intensity: " + results.totalCarbonIntensity.toFixed(2) + " g CO₂e/MJ",
      });
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: "There was an error performing the calculation. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const loadSampleData = () => {
    setState({ ...sampleData, results: null });
    toast({
      title: "Sample Data Loaded",
      description: "Sample data has been loaded into the calculator.",
    });
  };

  // Input Section Component
  const InputSection = () => {
    const renderCurrentStep = () => {
      switch (state.currentStep) {
        case 1:
          return (
            <FacilityInfoForm
              facilityInfo={state.facilityInfo}
              onChange={(facilityInfo) => setState({ ...state, facilityInfo })}
            />
          );
        case 2:
          return (
            <ElectricityInfoForm
              electricityInfo={state.electricityInfo}
              onChange={(electricityInfo) => setState({ ...state, electricityInfo })}
            />
          );
        case 3:
          return (
            <LivestockDataForm
              livestockData={state.livestockData}
              onChange={(livestockData) => setState({ ...state, livestockData })}
            />
          );
        case 4:
          return (
            <BiogasDataForm
              biogasData={state.biogasData}
              onChange={(biogasData) => setState({ ...state, biogasData })}
            />
          );
        case 5:
          return (
            <EnergyDataForm
              energyData={state.energyData}
              onChange={(energyData) => setState({ ...state, energyData })}
            />
          );
        case 6:
          return (
            <FuelProducedForm
              fuelProduced={state.fuelProduced}
              onChange={(fuelProduced) => setState({ ...state, fuelProduced })}
            />
          );
        default:
          return null;
      }
    };

    const handleNextStep = () => {
      if (state.currentStep < 6) {
        handleStepChange(state.currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const handlePrevStep = () => {
      if (state.currentStep > 1) {
        handleStepChange(state.currentStep - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    return (
      <div className="grid grid-cols-1 gap-6">
        {renderCurrentStep()}
        
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={state.currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Step
          </Button>
          
          {state.currentStep < 6 ? (
            <Button 
              onClick={handleNextStep}
              className="flex items-center gap-2"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleCalculate}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Calculate CI
            </Button>
          )}
        </div>
        
        <StepIndicator 
          currentStep={state.currentStep} 
          totalSteps={6} 
          onStepChange={handleStepChange} 
        />
      </div>
    );
  };

  // Results Section Component
  const ResultsSection = () => {
    if (!state.results) {
      return <div>No results available. Please calculate first.</div>;
    }

    return (
      <div>
        <CalculationResults results={state.results} />
        <TaxCreditResults 
          results={state.results} 
          biomethaneProduced={state.fuelProduced.biomethaneInjected} 
        />
        <ResultsCharts results={state.results} />
        
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => setActiveTab("input")}
            className="mr-2"
          >
            Back to Input
          </Button>
          <Button
            onClick={handleCalculate}
            className="bg-green-600 hover:bg-green-700"
          >
            Recalculate
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <CalculatorHeader onLoadSampleData={loadSampleData} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Input Data</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="methodology" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Methodology</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="mt-0">
          <InputSection />
        </TabsContent>
        
        <TabsContent value="results" className="mt-0">
          <ResultsSection />
        </TabsContent>
        <TabsContent value="methodology" className="mt-0">
          <FormulaExplanation />
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .calculator-step {
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .calculator-step-title {
          background-color: #f0fdf4;
          border-bottom: 1px solid #dcfce7;
          padding: 1rem 1.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #166534;
          display: flex;
          align-items: center;
        }
        
        .step-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #166534;
          color: white;
          border-radius: 9999px;
          height: 1.75rem;
          width: 1.75rem;
          font-size: 0.875rem;
          margin-right: 0.75rem;
        }
        
        .input-hint {
          font-size: 0.875rem;
          color: #4b5563;
          margin-top: 0.25rem;
        }
        
        .result-card {
          background-color: #f0fdf4;
          border: 1px solid #dcfce7;
          border-radius: 0.375rem;
          padding: 1rem;
        }
        
        .result-value {
          font-family: monospace;
          font-size: 1.25rem;
          font-weight: 700;
        }
        
        .formula-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
