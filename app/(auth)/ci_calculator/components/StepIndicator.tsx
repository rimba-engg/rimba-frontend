
import React from "react";
import { Button } from "@/components/ui/button";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

const stepIndicatorButtonStyle = (isActive: boolean) => 
  `w-8 h-8 rounded-full ${isActive ? "bg-green-600" : ""}`;

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  onStepChange 
}) => {
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          return (
            <Button
              key={step}
              variant={currentStep === step ? "default" : "outline"}
              size="icon"
              className={stepIndicatorButtonStyle(currentStep === step)}
              onClick={() => onStepChange(step)}
            >
              {step}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;