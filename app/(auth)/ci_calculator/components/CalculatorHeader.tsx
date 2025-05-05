import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database, DatabaseBackup } from "lucide-react";

interface CalculatorHeaderProps {
  onLoadSampleData: (version: string) => void;
}

const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({ onLoadSampleData }) => {
  const [version, setVersion] = useState("3.0");
  
  return (
    <Card className="mb-6">
      <CardHeader className="bg-green-50 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-green-800">CI Calculator</CardTitle>
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
              <option value="3.0">CA GREET 3.0</option>
              <option value="4.0">CA GREET 4.0</option>
            </select>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white" 
              onClick={() => onLoadSampleData(version)}
            >
              <Database className="h-4 w-4" />
              Load Sample Data
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white" 
              onClick={() => {alert('Coming Soon')}}
            >
              <DatabaseBackup className="h-4 w-4" />
              Load Excel
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default CalculatorHeader;