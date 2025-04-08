// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { CalculationResults as ResultsType } from "../page";

// interface CalculationResultsProps {
//   results: ResultsType | null;
// }

// const CalculationResults: React.FC<CalculationResultsProps> = ({ results }) => {
//   if (!results) {
//     return (
//       <Card className="calculator-step">
//         <CardHeader>
//           <CardTitle className="text-xl text-green-700">Results</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8 text-muted-foreground">
//             Complete all required inputs and calculate to see results.
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="calculator-step">
//       <CardHeader>
//         <CardTitle className="text-xl text-green-700">Carbon Intensity Results</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="result-card">
//           <h3 className="text-lg font-semibold text-green-800 mb-2">Final Carbon Intensity (CI)</h3>
//           <div className="flex items-center justify-between">
//             <span>Total Carbon Intensity:</span>
//             <span className="result-value">
//               {results.totalCarbonIntensity.toFixed(2)} g CO₂e/MJ
//             </span>
//           </div>
//           <p className="text-sm text-green-600 mt-2">
//             This is the final CI score for your biomethane pathway, accounting for both emissions and avoided methane credits.
//           </p>
//         </div>
        
//         <Separator />
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h3 className="text-md font-semibold text-blue-700 mb-3">Methane Emissions</h3>
            
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Baseline Methane Emissions:</span>
//                 <span className="font-semibold">
//                   {results.baselineMethaneEmissions.toFixed(2)} kg CH₄
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Project Methane Emissions:</span>
//                 <span className="font-semibold">
//                   {results.projectMethaneEmissions.toFixed(2)} kg CH₄
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between border-t pt-1">
//                 <span className="text-sm">Net Methane Avoided:</span>
//                 <span className="font-semibold text-green-600">
//                   {results.netMethaneAvoided.toFixed(2)} kg CH₄
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between bg-green-50 p-2 rounded-md">
//                 <span className="text-sm">Avoided Methane Credit:</span>
//                 <span className="font-semibold text-green-600">
//                   -{results.avoidedMethaneCredit.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           <div>
//             <h3 className="text-md font-semibold text-blue-700 mb-3">Energy-Related Emissions</h3>
            
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Electricity Emissions:</span>
//                 <span className="font-semibold">
//                   {results.electricityEmissions.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Natural Gas Emissions:</span>
//                 <span className="font-semibold">
//                   {results.naturalGasEmissions.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Diesel Emissions:</span>
//                 <span className="font-semibold">
//                   {results.dieselEmissions.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Fugitive Emissions:</span>
//                 <span className="font-semibold">
//                   {results.fugitiveEmissions.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h3 className="text-md font-semibold text-blue-700 mb-3">Transport & Tailpipe Emissions</h3>
            
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Transport Emissions:</span>
//                 <span className="font-semibold">
//                   {results.transportEmissions.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Tailpipe Emissions:</span>
//                 <span className="font-semibold">
//                   {results.tailpipeEmissions.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           <div>
//             <h3 className="text-md font-semibold text-blue-700 mb-3">CI Breakdown</h3>
            
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Total Positive Emissions:</span>
//                 <span className="font-semibold">
//                   {(
//                     results.electricityEmissions +
//                     results.naturalGasEmissions +
//                     results.dieselEmissions +
//                     results.fugitiveEmissions +
//                     results.tailpipeEmissions +
//                     results.transportEmissions
//                   ).toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-sm">Total Credits:</span>
//                 <span className="font-semibold text-green-600">
//                   -{results.avoidedMethaneCredit.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between border-t pt-1">
//                 <span className="text-sm">Net Carbon Intensity:</span>
//                 <span className="font-semibold">
//                   {results.totalCarbonIntensity.toFixed(2)} g CO₂e/MJ
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default CalculationResults;

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FormulaExplanation: React.FC = () => {
  return (
    <Card className="calculator-step">
      <CardHeader>
        <CardTitle className="text-xl text-green-700">Calculation Methodology</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          The Carbon Intensity (CI) calculation follows established methodologies for quantifying 
          lifecycle greenhouse gas emissions from biomethane production via anaerobic digestion.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="baseline-methane">
            <AccordionTrigger className="text-blue-700 font-medium">
              Baseline Methane Emissions
            </AccordionTrigger>
            <AccordionContent>
              <div className="formula-box">
                <p className="mb-2 font-medium">Formula:</p>
                <p className="font-mono">
                  BM<sub>CH₄</sub> ≈ Number of Animals × VS Excretion Rate × Bo × MCF
                </p>
                <p className="mt-4 text-sm">Where:</p>
                <ul className="text-sm ml-4 list-disc space-y-1 mt-2">
                  <li><strong>VS Excretion Rate</strong>: Volatile solids produced per animal per day (kg VS/animal/day)</li>
                  <li><strong>Bo</strong>: Maximum methane potential (m³ CH₄/kg VS)</li>
                  <li><strong>MCF</strong>: Methane Conversion Factor for the baseline system (0-1)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="project-methane">
            <AccordionTrigger className="text-blue-700 font-medium">
              Project Methane Emissions
            </AccordionTrigger>
            <AccordionContent>
              <div className="formula-box">
                <p className="mb-2 font-medium">Formula:</p>
                <p className="font-mono">
                  PM<sub>CH₄</sub> ≈ BM<sub>CH₄</sub> × (1 - Biogas Collection Efficiency) + Effluent Storage Emissions + Venting Emissions + Fugitive Emissions
                </p>
                <p className="mt-4 text-sm">Where:</p>
                <ul className="text-sm ml-4 list-disc space-y-1 mt-2">
                  <li><strong>Biogas Collection Efficiency</strong>: Percentage of methane captured (95% for Covered Lagoon, 98% for Enclosed Vessel)</li>
                  <li><strong>Effluent Storage Emissions</strong>: Methane from digested material storage</li>
                  <li><strong>Venting Emissions</strong>: Intentionally released biogas</li>
                  <li><strong>Fugitive Emissions</strong>: Unintentional methane leaks</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="avoided-methane">
            <AccordionTrigger className="text-blue-700 font-medium">
              Avoided Methane Credit
            </AccordionTrigger>
            <AccordionContent>
              <div className="formula-box">
                <p className="mb-2 font-medium">Formula:</p>
                <p className="font-mono mb-3">
                  Net CH₄ Avoided = BM<sub>CH₄</sub> - PM<sub>CH₄</sub>
                </p>
                <p className="font-mono">
                  AMC (g CO₂e/MJ) = (Net CH₄ Avoided (kg) × 25 × 1000) / Annual Biomethane Energy (MJ)
                </p>
                <p className="mt-4 text-sm">Where:</p>
                <ul className="text-sm ml-4 list-disc space-y-1 mt-2">
                  <li><strong>25</strong>: Global Warming Potential (GWP) of methane</li>
                  <li><strong>1000</strong>: Conversion from kg to g</li>
                  <li><strong>Annual Biomethane Energy</strong>: Total energy output in MJ</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="energy-emissions">
            <AccordionTrigger className="text-blue-700 font-medium">
              Energy-Related Emissions
            </AccordionTrigger>
            <AccordionContent>
              <div className="formula-box">
                <p className="mb-2 font-medium">Electricity Emissions:</p>
                <p className="font-mono text-sm">
                  E<sub>elec</sub> = (Annual Electricity (kWh) × EF<sub>elec</sub>) / Annual Biomethane Energy (MJ)
                </p>
                
                <p className="mb-2 mt-4 font-medium">Natural Gas Emissions:</p>
                <p className="font-mono text-sm">
                  E<sub>NG</sub> = (Annual NG (MMBtu) × EF<sub>NG</sub>) / Annual Biomethane Energy (MJ)
                </p>
                
                <p className="mb-2 mt-4 font-medium">Diesel Emissions:</p>
                <p className="font-mono text-sm">
                  E<sub>diesel</sub> = (Annual Diesel (Gallons) × EF<sub>diesel</sub>) / Annual Biomethane Energy (MJ)
                </p>
                
                <p className="mb-2 mt-4 font-medium">Fugitive Methane Emissions:</p>
                <p className="font-mono text-sm">
                  E<sub>fug</sub> = (Annual Biomethane Production (kg CH₄) × Fugitive Loss Rate × 25 × 1000) / Annual Biomethane Energy (MJ)
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="total-ci">
            <AccordionTrigger className="text-blue-700 font-medium">
              Total Carbon Intensity (CI)
            </AccordionTrigger>
            <AccordionContent>
              <div className="formula-box">
                <p className="mb-2 font-medium">Formula:</p>
                <p className="font-mono">
                  CI (g CO₂e/MJ) = (E<sub>elec</sub> + E<sub>NG</sub> + E<sub>diesel</sub> + E<sub>fug</sub> + Tailpipe Emissions + Transport Emissions) - (AMC + Diverted CO₂ Credit)
                </p>
                <p className="mt-4 text-sm">Simplified version:</p>
                <p className="font-mono text-sm mt-2">
                  CI ≈ (Electricity Emissions + Fugitive Methane Losses + Tailpipe Emissions) - Avoided Methane Credit
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FormulaExplanation;