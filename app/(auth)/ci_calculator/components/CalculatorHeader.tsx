
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

interface CalculatorHeaderProps {
  onLoadSampleData: () => void;
}

const cardHeaderStyle = "bg-green-50 border-b";
const cardTitleStyle = "text-2xl text-green-800";

const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({ onLoadSampleData }) => {
  return (
    <Card className="mb-6">
      <CardHeader className={cardHeaderStyle}>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className={cardTitleStyle}>Carbon Intensity Calculator</CardTitle>
            <CardDescription className="text-green-700 mt-1">
              Calculate the Carbon Intensity (CI) score for renewable energy projects
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white" 
            onClick={onLoadSampleData}
          >
            <Database className="h-4 w-4" />
            Load Sample Data
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-muted-foreground">
          This calculator helps determine the carbon intensity of renewable energy projects 
          by analyzing various operational parameters. Complete all sections to generate a detailed CI result.
        </p>
      </CardContent>
    </Card>
  );
};

export default CalculatorHeader;