
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calculator } from "lucide-react";
import StepIndicator from "./StepIndicator";
import { FacilityInfo, ElectricityInfo, LivestockData, BiogasData, EnergyData, FuelProduced } from "./lib/calculator-types";

import FacilityInfoForm from "./FacilityInfoForm";
import ElectricityInfoForm from "./ElectricityInfoForm";
import LivestockDataForm from "./LivestockDataForm";
import BiogasDataForm from "./BiogasDataForm";
import EnergyDataForm from "./EnergyDataForm";
import FuelProducedForm from "./FuelProducedForm";

interface InputSectionProps {
  currentStep: number;
  facilityInfo: FacilityInfo;
  electricityInfo: ElectricityInfo;
  livestockData: LivestockData;
  biogasData: BiogasData;
  energyData: EnergyData;
  fuelProduced: FuelProduced;
  onFacilityInfoChange: (facilityInfo: FacilityInfo) => void;
  onElectricityInfoChange: (electricityInfo: ElectricityInfo) => void;
  onLivestockDataChange: (livestockData: LivestockData) => void;
  onBiogasDataChange: (biogasData: BiogasData) => void;
  onEnergyDataChange: (energyData: EnergyData) => void;
  onFuelProducedChange: (fuelProduced: FuelProduced) => void;
  onStepChange: (step: number) => void;
  onCalculate: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  currentStep,
  facilityInfo,
  electricityInfo,
  livestockData,
  biogasData,
  energyData,
  fuelProduced,
  onFacilityInfoChange,
  onElectricityInfoChange,
  onLivestockDataChange,
  onBiogasDataChange,
  onEnergyDataChange,
  onFuelProducedChange,
  onStepChange,
  onCalculate
}) => {
  const handleNextStep = () => {
    if (currentStep < 6) {
      onStepChange(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FacilityInfoForm
            facilityInfo={facilityInfo}
            onChange={onFacilityInfoChange}
          />
        );
      case 2:
        return (
          <ElectricityInfoForm
            electricityInfo={electricityInfo}
            onChange={onElectricityInfoChange}
          />
        );
      case 3:
        return (
          <LivestockDataForm
            livestockData={livestockData}
            onChange={onLivestockDataChange}
          />
        );
      case 4:
        return (
          <BiogasDataForm
            biogasData={biogasData}
            onChange={onBiogasDataChange}
          />
        );
      case 5:
        return (
          <EnergyDataForm
            energyData={energyData}
            onChange={onEnergyDataChange}
          />
        );
      case 6:
        return (
          <FuelProducedForm
            fuelProduced={fuelProduced}
            onChange={onFuelProducedChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {renderCurrentStep()}
      
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous Step
        </Button>
        
        {currentStep < 6 ? (
          <Button 
            onClick={handleNextStep}
            className="flex items-center gap-2"
          >
            Next Step
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onCalculate}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculate CI
          </Button>
        )}
      </div>
      
      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={6} 
        onStepChange={onStepChange} 
      />
    </div>
  );
};

export default InputSection;