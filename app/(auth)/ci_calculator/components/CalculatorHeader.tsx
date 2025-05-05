import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

interface CalculatorHeaderProps {
  onLoadSampleData: (version: string) => void;
}

const cardHeaderStyle = "bg-green-50 border-b";
const cardTitleStyle = "text-2xl text-green-800";

const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({ onLoadSampleData }) => {
  const [version, setVersion] = useState("3.0");
  
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
          <div className="flex items-center gap-2">
            <select 
              className="h-10 px-3 py-2 text-sm border border-input rounded-md"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            >
              <option value="3.0">Version 3.0</option>
              <option value="4.0">Version 4.0</option>
            </select>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white" 
              onClick={() => onLoadSampleData(version)}
            >
              <Database className="h-4 w-4" />
              Load Sample Data
            </Button>
          </div>
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