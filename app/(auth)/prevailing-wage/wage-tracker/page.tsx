'use client'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DateSelector from "@/components/selectors/DateSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { WageEntry } from "@/app/(auth)/prevailing-wage/types";

const WageTracker = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    toast.info(`Wages filtered for ${date.toLocaleDateString()}`);
  };

  // Mock wage entries
  const wageEntries: WageEntry[] = [
    {
      id: "1",
      contractorId: "101",
      projectId: "1",
      employeeName: "John Smith",
      classification: "Electrician",
      hoursWorked: 40,
      rate: 45.75,
      grossWages: 1830,
      requiredRate: 45.75,
      compliant: true,
      week: "2023-04-01"
    },
    {
      id: "2",
      contractorId: "101",
      projectId: "1",
      employeeName: "Mark Johnson",
      classification: "Electrician",
      hoursWorked: 38,
      rate: 45.75,
      grossWages: 1738.5,
      requiredRate: 45.75,
      compliant: true,
      week: "2023-04-01"
    },
    {
      id: "3",
      contractorId: "102",
      projectId: "2",
      employeeName: "Robert Davis",
      classification: "Plumber",
      hoursWorked: 40,
      rate: 42.50,
      grossWages: 1700,
      requiredRate: 43.25,
      compliant: false,
      underpaymentAmount: 30,
      week: "2023-04-01"
    },
    {
      id: "4",
      contractorId: "103",
      projectId: "1",
      employeeName: "Michael Wilson",
      classification: "Carpenter",
      hoursWorked: 35,
      rate: 38.50,
      grossWages: 1347.5,
      requiredRate: 38.50,
      compliant: true,
      week: "2023-04-01"
    }
  ];

  const filteredEntries = wageEntries.filter(entry => 
    entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.classification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Wage Tracker</h1>
        <DateSelector onDateChange={handleDateChange} />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wage Compliance Tracking</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate Paid</TableHead>
                  <TableHead>Gross Wages</TableHead>
                  <TableHead>Required Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Underpayment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className={!entry.compliant ? "bg-red-50" : ""}>
                    <TableCell className="font-medium">{entry.employeeName}</TableCell>
                    <TableCell>{entry.classification}</TableCell>
                    <TableCell>{entry.hoursWorked}</TableCell>
                    <TableCell>${entry.rate.toFixed(2)}</TableCell>
                    <TableCell>${entry.grossWages.toFixed(2)}</TableCell>
                    <TableCell>${entry.requiredRate.toFixed(2)}</TableCell>
                    <TableCell>
                      {entry.compliant ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Non-Compliant
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.underpaymentAmount ? `$${entry.underpaymentAmount.toFixed(2)}` : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WageTracker;