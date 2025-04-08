"use client";

import React from "react";

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
            <button
              key={step}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${currentStep === step ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-input hover:bg-accent hover:text-accent-foreground"} h-10 w-10 ${stepIndicatorButtonStyle(currentStep === step)}`}
              onClick={() => onStepChange(step)}
            >
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;