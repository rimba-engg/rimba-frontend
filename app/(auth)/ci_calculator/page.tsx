"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FileText, Calculator, Info } from "lucide-react";

import CalculatorHeader from "./components/CalculatorHeader";
import ResultsSection from "./components/ResultSelection";
import FormulaExplanation from "./components/FormulaExplanation";
import { CalculatorState, defaultCalculatorState } from "./components/lib/calculator-types";
import { calculateTotalCarbonIntensity } from "./components/lib/calculator";
import InputSection from "./components/InputSelection";

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

const CICalculator: React.FC = () => {
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

  return (
    <div className="container mx-auto p-4">
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
          <InputSection 
            currentStep={state.currentStep}
            facilityInfo={state.facilityInfo}
            electricityInfo={state.electricityInfo}
            livestockData={state.livestockData}
            biogasData={state.biogasData}
            energyData={state.energyData}
            fuelProduced={state.fuelProduced}
            onFacilityInfoChange={(facilityInfo) => setState({ ...state, facilityInfo })}
            onElectricityInfoChange={(electricityInfo) => setState({ ...state, electricityInfo })}
            onLivestockDataChange={(livestockData) => setState({ ...state, livestockData })}
            onBiogasDataChange={(biogasData) => setState({ ...state, biogasData })}
            onEnergyDataChange={(energyData) => setState({ ...state, energyData })}
            onFuelProducedChange={(fuelProduced) => setState({ ...state, fuelProduced })}
            onStepChange={handleStepChange}
            onCalculate={handleCalculate}
          />
        </TabsContent>
        
        <TabsContent value="results" className="mt-0">
          <ResultsSection 
            results={state.results}
            biomethaneProduced={state.fuelProduced.biomethaneInjected}
            onBack={() => setActiveTab("input")}
            onRecalculate={handleCalculate}
          />
        </TabsContent>
        
        <TabsContent value="methodology" className="mt-0">
          <FormulaExplanation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CICalculator;
