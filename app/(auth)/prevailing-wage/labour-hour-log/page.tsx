'use client'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LaborHourLogEntry } from "@/app/(auth)/prevailing-wage/types";
import { Clock, FileText } from "lucide-react";
import DateSelector from "@/components/selectors/DateSelector";
import { toast } from "sonner";

const LaborHourLog = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterContractor, setFilterContractor] = useState<string>("all");
  const [filterTrade, setFilterTrade] = useState<string>("all");

  // Mock data for labor hour log entries
  const [laborHourLogEntries, setLaborHourLogEntries] = useState<LaborHourLogEntry[]>([
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
    },
    {
      week: "2023-03-18",
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
      week: "2023-03-18",
      contractor: "Green Landscaping",
      trade: "Landscaping",
      journeymanHours: 60,
      apprenticeHours: 0,
      journeyworkerCount: 2,
      apprenticeCount: 0,
      totalHours: 60,
      apprenticePercentage: 0,
      meetsRatio: false,
      hoursShort: 15,
      penaltyRate: 22,
      penaltyAmount: 330
    }
  ]);

  // Available contractors and trades for filtering
  const contractors = Array.from(new Set(laborHourLogEntries.map(entry => entry.contractor)));
  const trades = Array.from(new Set(laborHourLogEntries.map(entry => entry.trade)));

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    toast.info(`Data filtered for ${date.toLocaleDateString()}`);
  };

  const handleApprenticeRegistration = (contractor: string) => {
    toast.success(`Opening apprentice registration for ${contractor}`);
  };

  // Filter entries based on selected filters
  const filteredEntries = laborHourLogEntries.filter(entry => {
    return (
      (filterContractor === "all" || entry.contractor === filterContractor) &&
      (filterTrade === "all" || entry.trade === filterTrade)
    );
  });

  // Calculate summary statistics
  const totalJourneymanHours = filteredEntries.reduce((sum, entry) => sum + entry.journeymanHours, 0);
  const totalApprenticeHours = filteredEntries.reduce((sum, entry) => sum + entry.apprenticeHours, 0);
  const totalHours = totalJourneymanHours + totalApprenticeHours;
  const apprenticePercentage = totalHours > 0 ? (totalApprenticeHours / totalHours) * 100 : 0;
  const totalPenaltyAmount = filteredEntries.reduce((sum, entry) => sum + entry.penaltyAmount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Labor Hour Log</h1>
        <DateSelector onDateChange={handleDateChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHours.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Apprentice Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalApprenticeHours.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Apprentice %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{apprenticePercentage.toFixed(1)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Penalty Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalPenaltyAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-64">
          <Select value={filterContractor} onValueChange={setFilterContractor}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Contractor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contractors</SelectItem>
              {contractors.map((contractor) => (
                <SelectItem key={contractor} value={contractor}>{contractor}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-64">
          <Select value={filterTrade} onValueChange={setFilterTrade}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Trade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              {trades.map((trade) => (
                <SelectItem key={trade} value={trade}>{trade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => {
          setFilterContractor("all");
          setFilterTrade("all");
        }}>
          Clear Filters
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Labor Hour Log</CardTitle>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">Updated {new Date().toLocaleDateString()}</span>
          </div>
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
                  <th className="px-4 py-2 text-right">Hours Short</th>
                  <th className="px-4 py-2 text-right">Penalty ($)</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
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
                    <td className="px-4 py-2 text-right">{entry.hoursShort}</td>
                    <td className="px-4 py-2 text-right">${entry.penaltyAmount}</td>
                    <td className="px-4 py-2 text-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleApprenticeRegistration(entry.contractor)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Register
                      </Button>
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

export default LaborHourLog;