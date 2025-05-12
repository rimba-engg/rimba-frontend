'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LaborHourLogEntry } from "@/app/(auth)/prevailing-wage/types";

const Apprenticeship = () => {
  // Mock labor hour log entries
  const laborHourLogEntries: LaborHourLogEntry[] = [
    {
      week: "2023-04-01",
      contractor: "ABC Construction",
      trade: "Electrical",
      journeymanHours: 160,
      apprenticeHours: 40,
      journeyworkerCount: 4,
      apprenticeCount: 1,
      totalHours: 200,
      apprenticePercentage: 20,
      meetsRatio: true,
      hoursShort: 0,
      penaltyRate: 0,
      penaltyAmount: 0
    },
    {
      week: "2023-04-01",
      contractor: "XYZ Plumbing",
      trade: "Plumbing",
      journeymanHours: 120,
      apprenticeHours: 0,
      journeyworkerCount: 3,
      apprenticeCount: 0,
      totalHours: 120,
      apprenticePercentage: 0,
      meetsRatio: false,
      hoursShort: 30,
      penaltyRate: 25,
      penaltyAmount: 750
    },
    {
      week: "2023-03-25",
      contractor: "ABC Construction",
      trade: "Electrical",
      journeymanHours: 140,
      apprenticeHours: 40,
      journeyworkerCount: 4,
      apprenticeCount: 1,
      totalHours: 180,
      apprenticePercentage: 22.2,
      meetsRatio: true,
      hoursShort: 0,
      penaltyRate: 0,
      penaltyAmount: 0
    },
    {
      week: "2023-03-25",
      contractor: "Smith Carpentry",
      trade: "Carpentry",
      journeymanHours: 80,
      apprenticeHours: 40,
      journeyworkerCount: 2,
      apprenticeCount: 1,
      totalHours: 120,
      apprenticePercentage: 33.3,
      meetsRatio: true,
      hoursShort: 0,
      penaltyRate: 0,
      penaltyAmount: 0
    }
  ];

  // Mock data
  const totalLaborHours = laborHourLogEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const totalApprenticeHours = laborHourLogEntries.reduce((sum, entry) => sum + entry.apprenticeHours, 0);
  const requiredPercentage = 15;
  const achievedPercentage = (totalApprenticeHours / totalLaborHours) * 100;
  
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
          <CardTitle>Labor Hour Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Week</th>
                  <th className="px-4 py-2 text-left">Contractor</th>
                  <th className="px-4 py-2 text-left">Trade</th>
                  <th className="px-4 py-2 text-right">Journeyman Hours</th>
                  <th className="px-4 py-2 text-right">Apprentice Hours</th>
                  <th className="px-4 py-2 text-right"># Journeyworkers</th>
                  <th className="px-4 py-2 text-right"># Apprentices</th>
                  <th className="px-4 py-2 text-right">Total Hours</th>
                  <th className="px-4 py-2 text-right">Apprentice %</th>
                  <th className="px-4 py-2 text-center">Meets Ratio</th>
                </tr>
              </thead>
              <tbody>
                {laborHourLogEntries.map((entry, index) => (
                  <tr 
                    key={index} 
                    className={`border-b ${!entry.meetsRatio ? "bg-red-50" : ""}`}
                  >
                    <td className="px-4 py-2">{entry.week}</td>
                    <td className="px-4 py-2 font-medium">{entry.contractor}</td>
                    <td className="px-4 py-2">{entry.trade}</td>
                    <td className="px-4 py-2 text-right">{entry.journeymanHours}</td>
                    <td className="px-4 py-2 text-right">{entry.apprenticeHours}</td>
                    <td className="px-4 py-2 text-right">{entry.journeyworkerCount}</td>
                    <td className="px-4 py-2 text-right">{entry.apprenticeCount}</td>
                    <td className="px-4 py-2 text-right">{entry.totalHours}</td>
                    <td className="px-4 py-2 text-right">{entry.apprenticePercentage.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-center">
                      {entry.meetsRatio ? (
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