'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectLaborHourEntry } from "@/app/(auth)/prevailing-wage/types";

const Apprenticeship = () => {
  // Mock data
  const totalLaborHours = 12500;
  const totalApprenticeHours = 1875;
  const requiredPercentage = 15;
  const achievedPercentage = (totalApprenticeHours / totalLaborHours) * 100;

  // Mock project labor hour entries
  const projectLaborHours: ProjectLaborHourEntry[] = [
    {
      projectName: "GreenFlame BioEnergy",
      journeymanHours: 320,
      apprenticeHours: 80,
      journeyworkerCount: 8,
      apprenticeCount: 2,
      totalHours: 400,
      apprenticePercentage: 20,
      meetsRatio: true
    },
    {
      projectName: "Green Valley",
      journeymanHours: 160,
      apprenticeHours: 0,
      journeyworkerCount: 4,
      apprenticeCount: 0,
      totalHours: 160,
      apprenticePercentage: 0,
      meetsRatio: false
    },
    {
      projectName: "Riverfront Development",
      journeymanHours: 240,
      apprenticeHours: 80,
      journeyworkerCount: 6,
      apprenticeCount: 2,
      totalHours: 320,
      apprenticePercentage: 25,
      meetsRatio: true
    },
    {
      projectName: "Solar Farm Installation",
      journeymanHours: 400,
      apprenticeHours: 120,
      journeyworkerCount: 10,
      apprenticeCount: 3,
      totalHours: 520,
      apprenticePercentage: 23.1,
      meetsRatio: true
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Apprenticeship</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Total Labor Hours</h3>
              <p className="text-3xl font-bold">{totalLaborHours.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Total Apprentice Hours</h3>
              <p className="text-3xl font-bold">{totalApprenticeHours.toLocaleString()}</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Apprenticeship Percentage</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{achievedPercentage.toFixed(1)}% of required {requiredPercentage}%</span>
                  <span className="text-sm font-medium">{achievedPercentage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={achievedPercentage} 
                  className={achievedPercentage >= requiredPercentage ? "bg-green-100" : "bg-yellow-100"}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Labor Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Project Name</th>
                  <th className="px-4 py-2 text-right">Journeyman Hours</th>
                  <th className="px-4 py-2 text-right">Apprentice Hours</th>
                  <th className="px-4 py-2 text-right"># Journey Workers</th>
                  <th className="px-4 py-2 text-right"># Apprentices</th>
                  <th className="px-4 py-2 text-right">Total Hours</th>
                  <th className="px-4 py-2 text-right">Apprentice %</th>
                  <th className="px-4 py-2 text-center">Meets Ratio</th>
                </tr>
              </thead>
              <tbody>
                {projectLaborHours.map((project, index) => (
                  <tr 
                    key={index} 
                    className={`border-b ${!project.meetsRatio ? "bg-red-50" : ""}`}
                  >
                    <td className="px-4 py-2 font-medium">{project.projectName}</td>
                    <td className="px-4 py-2 text-right">{project.journeymanHours}</td>
                    <td className="px-4 py-2 text-right">{project.apprenticeHours}</td>
                    <td className="px-4 py-2 text-right">{project.journeyworkerCount}</td>
                    <td className="px-4 py-2 text-right">{project.apprenticeCount}</td>
                    <td className="px-4 py-2 text-right">{project.totalHours}</td>
                    <td className="px-4 py-2 text-right">{project.apprenticePercentage.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-center">
                      {project.meetsRatio ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Apprenticeship;