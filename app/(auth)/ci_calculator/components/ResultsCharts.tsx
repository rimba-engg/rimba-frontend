
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculationResults } from "./lib/calculator-types";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell, Tooltip } from "recharts";

interface ResultsChartsProps {
  results: CalculationResults | null;
}

const ResultsCharts: React.FC<ResultsChartsProps> = ({ results }) => {
  if (!results) {
    return null;
  }

  // Format data for the bar chart
  const emissionsData = [
    { name: "Electricity", value: results.electricityEmissions, fill: "#4EABCC" },
    { name: "Natural Gas", value: results.naturalGasEmissions, fill: "#6AB491" },
    { name: "Diesel", value: results.dieselEmissions, fill: "#BFE0CD" },
    { name: "Fugitive", value: results.fugitiveEmissions, fill: "#D8EBF4" },
    { name: "Transport", value: results.transportEmissions, fill: "#77BFDA" },
    { name: "Tailpipe", value: results.tailpipeEmissions, fill: "#94CAB0" },
  ];

  // Format data for the pie chart
  const ciBreakdown = [
    { name: "Emissions", value: results.electricityEmissions + results.naturalGasEmissions + 
      results.dieselEmissions + results.fugitiveEmissions + results.transportEmissions + 
      results.tailpipeEmissions, fill: "#1A759F" },
    { name: "Credits", value: results.avoidedMethaneCredit, fill: "#2D6A4F" },
  ];

  // Format data for methane reduction
  const methaneData = [
    { name: "Baseline", value: results.baselineMethaneEmissions, fill: "#DCEFE3" },
    { name: "Project", value: results.projectMethaneEmissions, fill: "#BFE0CD" },
    { name: "Avoided", value: results.netMethaneAvoided, fill: "#2D6A4F" },
  ];

  const chartConfig = {
    emissions: {
      Electricity: { color: "#4EABCC" },
      "Natural Gas": { color: "#6AB491" },
      Diesel: { color: "#BFE0CD" },
      Fugitive: { color: "#D8EBF4" },
      Transport: { color: "#77BFDA" },
      Tailpipe: { color: "#94CAB0" },
    },
    breakdown: {
      Emissions: { color: "#1A759F" },
      Credits: { color: "#2D6A4F" },
    },
    methane: {
      Baseline: { color: "#DCEFE3" },
      Project: { color: "#BFE0CD" },
      Avoided: { color: "#2D6A4F" },
    }
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="text-xl text-green-700">Visualization Charts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-blue-700 mb-4">Emissions by Source (g CO₂e/MJ)</h3>
            <div className="h-64">
              <ChartContainer config={chartConfig.emissions}>
                <BarChart data={emissionsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-blue-700 mb-4">CI Breakdown</h3>
            <div className="h-64">
              <ChartContainer config={chartConfig.breakdown}>
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <Pie
                    data={ciBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {ciBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-blue-700 mb-4">Methane Emissions Reduction (kg CH₄)</h3>
          <div className="h-64">
            <ChartContainer config={chartConfig.methane}>
              <BarChart data={methaneData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsCharts;