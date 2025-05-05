
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
    <Card className="p-4">
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