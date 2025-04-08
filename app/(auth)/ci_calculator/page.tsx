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

export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const electricityMixOptions = [
  { label: "CAMX - California", value: "CAMX", emissionFactor: 241.2 },
  { label: "NWPP - Northwest", value: "NWPP", emissionFactor: 340.5 },
  { label: "RMPA - Rocky Mountains", value: "RMPA", emissionFactor: 520.8 },
  { label: "AZNM - Southwest", value: "AZNM", emissionFactor: 480.5 },
  { label: "MROW - Midwest", value: "MROW", emissionFactor: 568.8 },
  { label: "SRMV - South Central", value: "SRMV", emissionFactor: 410.6 },
  { label: "RFCE - RFC East", value: "RFCE", emissionFactor: 338.2 },
  { label: "RFCM - RFC Michigan", value: "RFCM", emissionFactor: 592.7 },
  { label: "RFCW - RFC West", value: "RFCW", emissionFactor: 537.3 },
  { label: "SRSO - Southeast", value: "SRSO", emissionFactor: 492.0 },
  { label: "NEWE - New England", value: "NEWE", emissionFactor: 253.5 },
  { label: "NYUP - Upstate NY", value: "NYUP", emissionFactor: 158.1 },
  { label: "NYCW - NYC/Westchester", value: "NYCW", emissionFactor: 267.9 },
  { label: "FRCC - Florida", value: "FRCC", emissionFactor: 445.9 }
];

export const defaultCalculatorState: CalculatorState = {
  facilityInfo: {
    companyName: "",
    facilityName: "",
    reportingMonth: months[0],
    digesterType: "Enclosed Vessel",
    digesterLocation: "",
    avgAnnualTemperature: 15,
  },
  electricityInfo: {
    electricityMix: "CAMX",
    efElec: 241.2,
  },
  livestockData: {
    livestockType: "Dairy",
    numberOfAnimals: 0,
    baselineManureSystem: "Open Lagoon",
    retentionTimeNotes: "",
    populationCalendarDays: [],
    reportingDays: 30,
    avgStorageTemperature: 20,
    fractionVS: 0.8,
    carryoverFromPreviousMonth: 0,
  },
  biogasData: {
    rawBiogasFlow: 0,
    rawBiogasMethaneContent: 60,
    flaredBiogasFlow: 0,
    flaredBiogasMethaneContent: 60,
    biogasToUpgrading: 0,
    upgradingFeedstockMethane: 60,
  },
  energyData: {
    baselineDieselConsumption: 0,
    baselineNaturalGasConsumption: 0,
    baselineElectricityConsumption: 0,
    digesterBiogasConsumption: 0,
    digesterNaturalGasConsumption: 0,
    digesterElectricityConsumption: 0,
    digesterDieselConsumption: 0,
    upgradingNaturalGasConsumption: 0,
    upgradingBiogasConsumption: 0,
    upgradingElectricityConsumption: 0,
    upgradingDieselConsumption: 0,
    biomethaneTailGasFlow: 0,
    tailGasMethaneContent: 1.5,
  },
  fuelProduced: {
    biomethaneInjected: 0,
    electricityProducedOnsite: 0,
    distanceToCNG: 50,
    percentCNGtoLNG: 0,
  },
  results: null,
  currentStep: 1
};

const sampleData: CalculatorState = {
  facilityInfo: {
    companyName: "Green Energy Solutions",
    facilityName: "Midwest Biogas Facility",
    reportingMonth: "June",
    digesterType: "Enclosed Vessel",
    digesterLocation: "Iowa, USA",
    avgAnnualTemperature: 15,
  },
  electricityInfo: {
    electricityMix: "CAMX",
    efElec: 241.2,
  },
  livestockData: {
    livestockType: "Dairy",
    numberOfAnimals: 2500,
    baselineManureSystem: "Open Lagoon",
    retentionTimeNotes: "30-day retention time in lagoon",
    populationCalendarDays: [
      { population: 2500, days: 30 }
    ],
    reportingDays: 30,
    avgStorageTemperature: 22,
    fractionVS: 0.85,
    carryoverFromPreviousMonth: 0,
  },
  biogasData: {
    rawBiogasFlow: 2500000,
    rawBiogasMethaneContent: 62,
    flaredBiogasFlow: 50000,
    flaredBiogasMethaneContent: 62,
    biogasToUpgrading: 2450000,
    upgradingFeedstockMethane: 62,
  },
  energyData: {
    baselineDieselConsumption: 500,
    baselineNaturalGasConsumption: 0,
    baselineElectricityConsumption: 5000,
    digesterBiogasConsumption: 100000,
    digesterNaturalGasConsumption: 0,
    digesterElectricityConsumption: 25000,
    digesterDieselConsumption: 200,
    upgradingNaturalGasConsumption: 0,
    upgradingBiogasConsumption: 50000,
    upgradingElectricityConsumption: 15000,
    upgradingDieselConsumption: 100,
    biomethaneTailGasFlow: 75000,
    tailGasMethaneContent: 1.5,
  },
  fuelProduced: {
    biomethaneInjected: 2300,
    electricityProducedOnsite: 7500,
    distanceToCNG: 50,
    percentCNGtoLNG: 15,
  },
  results: null,
  currentStep: 1
};

// Utility functions
export const calculateTotalCarbonIntensity = (
  facilityInfo: FacilityInfo,
  electricityInfo: ElectricityInfo,
  livestockData: LivestockData,
  biogasData: BiogasData,
  energyData: EnergyData,
  fuelProduced: FuelProduced
): CalculationResults => {
  // Constants
  const METHANE_GWP = 25; // Global Warming Potential of methane (CO2e)
  const MJ_PER_MMBTU = 1055.06; // Conversion factor: 1 MMBtu = 1055.06 MJ
  const METHANE_DENSITY = 0.0191; // kg/scf at standard conditions
  const EF_DIESEL = 10.21; // kg CO2e/gallon
  const EF_NG = 53.11; // kg CO2e/MMBtu
  const FUGITIVE_LOSS_RATE = 0.015; // 1.5% fugitive methane loss rate

  // Calculate total biomethane energy in MJ
  const totalEnergyMJ = fuelProduced.biomethaneInjected * MJ_PER_MMBTU;

  // 1. Calculate Baseline Methane Emissions
  let mcfValue = 0;
  switch (livestockData.baselineManureSystem) {
    case "Open Lagoon":
      mcfValue = 0.75;
      break;
    case "Storage Pit/Basin":
      mcfValue = 0.35;
      break;
    case "Daily Spread/Dry Lot":
      mcfValue = 0.1;
      break;
    default:
      mcfValue = 0.5;
  }

  let vsExcretionRate = 0;
  let boValue = 0;
  
  if (livestockData.livestockType === "Dairy") {
    vsExcretionRate = 8.4; // kg VS/animal/day for dairy cows
    boValue = 0.24; // m³ CH4/kg VS
  } else if (livestockData.livestockType === "Swine") {
    vsExcretionRate = 0.5; // kg VS/animal/day for swine
    boValue = 0.48; // m³ CH4/kg VS
  }

  // Calculate baseline methane emissions (kg)
  const baselineMethaneEmissions = 
    livestockData.numberOfAnimals * 
    vsExcretionRate * 
    livestockData.reportingDays * 
    livestockData.fractionVS * 
    boValue * 
    mcfValue * 
    0.67; // Convert m³ to kg

  // 2. Calculate Project Methane Emissions
  // Digester collection efficiency based on digester type
  const collectionEfficiency = 
    facilityInfo.digesterType === "Enclosed Vessel" ? 0.98 : 0.95;

  // Calculate methane in tail gas (kg)
  const tailGasMethane = 
    energyData.biomethaneTailGasFlow * 
    (energyData.tailGasMethaneContent / 100) * 
    METHANE_DENSITY;

  // Calculate uncaptured methane (kg)
  const uncapturedMethane = baselineMethaneEmissions * (1 - collectionEfficiency);

  // Calculate project methane emissions (kg)
  const projectMethaneEmissions = uncapturedMethane + tailGasMethane;

  // 3. Calculate Net Methane Avoided (kg)
  const netMethaneAvoided = baselineMethaneEmissions - projectMethaneEmissions;

  // 4. Calculate Avoided Methane Credit (g CO2e/MJ)
  const avoidedMethaneCredit = (netMethaneAvoided * METHANE_GWP * 1000) / totalEnergyMJ;

  // 5. Calculate Energy-Related Emissions

  // Electricity emissions (g CO2e/MJ)
  const electricityEmissions = 
    ((energyData.digesterElectricityConsumption + 
     energyData.upgradingElectricityConsumption - 
     energyData.baselineElectricityConsumption - 
     fuelProduced.electricityProducedOnsite) * 
     electricityInfo.efElec) / totalEnergyMJ;

  // Natural gas emissions (g CO2e/MJ)
  const naturalGasEmissions = 
    ((energyData.digesterNaturalGasConsumption + 
      energyData.upgradingNaturalGasConsumption - 
      energyData.baselineNaturalGasConsumption) * 
     EF_NG * 1000) / totalEnergyMJ;

  // Diesel emissions (g CO2e/MJ)
  const dieselEmissions = 
    ((energyData.digesterDieselConsumption + 
      energyData.upgradingDieselConsumption - 
      energyData.baselineDieselConsumption) * 
     EF_DIESEL * 1000) / totalEnergyMJ;

  // Calculate total methane produced (kg)
  const totalMethaneProduced = 
    biogasData.biogasToUpgrading * 
    (biogasData.upgradingFeedstockMethane / 100) * 
    METHANE_DENSITY;

  // Fugitive emissions (g CO2e/MJ)
  const fugitiveEmissions = 
    (totalMethaneProduced * FUGITIVE_LOSS_RATE * METHANE_GWP * 1000) / totalEnergyMJ;

  // 6. Calculate Transport and Tailpipe Emissions

  // Transport emissions (g CO2e/MJ) - Simple model based on distance
  const transportEmissions = (fuelProduced.distanceToCNG * 0.1) / totalEnergyMJ;

  // Additional emissions if converting to LNG
  const lngConversionEmissions = 
    (fuelProduced.percentCNGtoLNG / 100) * 10; // 10 g CO2e/MJ for LNG conversion

  // Tailpipe emissions (g CO2e/MJ)
  const tailpipeEmissions = 1.0 + lngConversionEmissions; // Base tailpipe emissions + LNG if applicable

  // 7. Calculate Total Carbon Intensity (g CO2e/MJ)
  const totalCarbonIntensity = 
    electricityEmissions + 
    naturalGasEmissions + 
    dieselEmissions + 
    fugitiveEmissions + 
    transportEmissions + 
    tailpipeEmissions - 
    avoidedMethaneCredit;

  return {
    baselineMethaneEmissions,
    projectMethaneEmissions,
    netMethaneAvoided,
    avoidedMethaneCredit,
    electricityEmissions,
    naturalGasEmissions,
    dieselEmissions,
    fugitiveEmissions,
    transportEmissions,
    tailpipeEmissions,
    totalCarbonIntensity,
  };
};

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

// For importing in page.tsx
export function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  [key: string]: any;
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}

export function ArrowLeft(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function ArrowRight(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
