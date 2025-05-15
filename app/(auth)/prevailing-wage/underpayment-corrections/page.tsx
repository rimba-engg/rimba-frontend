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
import { Edit, Search } from "lucide-react";
import DateSelector from "@/components/selectors/DateSelector";
import { toast } from "sonner";

interface UnderpaymentItem {
  id: string;
  contractor: string;
  employeeName: string;
  workClassification: string;
  projectSite: string;
  payPeriod: string;
  regularHours: number;
  overtimeHours: number;
  requiredRate: number;
  paidRate: number;
  underpaymentAmount: number;
  originalPaymentDate: string;
  interestRate: number;
  interestAmount: number;
  totalDue: number;
  correctionDate: string | null;
  status: 'pending' | 'corrected';
}

const FEDERAL_INTEREST_RATE = 5.0; // Example federal interest rate

const calculateInterestAmount = (
  underpaymentAmount: number,
  originalPaymentDate: string,
  correctionDate: string | null,
  interestRate: number
): number => {
  if (!correctionDate) {
    correctionDate = new Date().toISOString().split('T')[0];
  }
  
  const originalDate = new Date(originalPaymentDate);
  const correctionDateTime = new Date(correctionDate);
  const daysOutstanding = Math.floor((correctionDateTime.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Interest rate calculation: Federal rate + 6%
  const totalInterestRate = (FEDERAL_INTEREST_RATE + 6) / 100;
  
  return Number((underpaymentAmount * totalInterestRate * daysOutstanding / 365).toFixed(2));
};

const UnderpaymentCorrections = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterContractor, setFilterContractor] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Mock data for underpayment corrections
  const [underpayments, setUnderpayments] = useState<UnderpaymentItem[]>([
    {
      id: "1",
      contractor: "ABC Construction",
      employeeName: "John Smith",
      workClassification: "Electrician",
      projectSite: "GreenFlame BioEnergy",
      payPeriod: "2023-03-15",
      regularHours: 32,
      overtimeHours: 8,
      requiredRate: 45.75,
      paidRate: 40.00,
      underpaymentAmount: 230.00,
      originalPaymentDate: "2023-03-20",
      interestRate: FEDERAL_INTEREST_RATE + 6,
      interestAmount: 12.65,
      totalDue: 242.65,
      correctionDate: null,
      status: 'pending'
    },
    {
      id: "2",
      contractor: "XYZ Plumbing",
      employeeName: "David Jones",
      workClassification: "Plumber",
      projectSite: "Green Valley",
      payPeriod: "2023-03-10",
      regularHours: 35,
      overtimeHours: 5,
      requiredRate: 42.50,
      paidRate: 38.00,
      underpaymentAmount: 180.00,
      originalPaymentDate: "2023-03-15",
      interestRate: FEDERAL_INTEREST_RATE + 6,
      interestAmount: 9.90,
      totalDue: 189.90,
      correctionDate: "2023-04-05",
      status: 'corrected'
    },
    {
      id: "3",
      contractor: "Smith Carpentry",
      employeeName: "Michael Brown",
      workClassification: "Carpenter",
      projectSite: "GreenFlame BioEnergy",
      payPeriod: "2023-03-15",
      regularHours: 40,
      overtimeHours: 0,
      requiredRate: 38.25,
      paidRate: 35.00,
      underpaymentAmount: 130.00,
      originalPaymentDate: "2023-03-20",
      interestRate: FEDERAL_INTEREST_RATE + 6,
      interestAmount: 7.15,
      totalDue: 137.15,
      correctionDate: null,
      status: 'pending'
    },
    {
      id: "4",
      contractor: "ABC Construction",
      employeeName: "Robert Miller",
      workClassification: "Electrician",
      projectSite: "GreenFlame BioEnergy",
      payPeriod: "2023-03-15",
      regularHours: 36,
      overtimeHours: 6,
      requiredRate: 45.75,
      paidRate: 43.00,
      underpaymentAmount: 110.00,
      originalPaymentDate: "2023-03-20",
      interestRate: FEDERAL_INTEREST_RATE + 6,
      interestAmount: 6.05,
      totalDue: 116.05,
      correctionDate: "2023-04-01",
      status: 'corrected'
    }
  ]);

  // Available contractors and projects for filtering
  const contractors = Array.from(new Set(underpayments.map(item => item.contractor)));
  const projects = Array.from(new Set(underpayments.map(item => item.projectSite)));

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    toast.info(`Data filtered for ${date.toLocaleDateString()}`);
  };

  const handleCorrection = (id: string) => {
    const correctionDate = new Date().toISOString().split('T')[0];
    
    setUnderpayments(underpayments.map(item => {
      if (item.id === id) {
        // Recalculate interest amount based on actual correction date
        const newInterestAmount = calculateInterestAmount(
          item.underpaymentAmount,
          item.originalPaymentDate,
          correctionDate,
          item.interestRate
        );
        
        return {
          ...item,
          correctionDate,
          interestAmount: newInterestAmount,
          totalDue: item.underpaymentAmount + newInterestAmount,
          status: 'corrected' as const
        };
      }
      return item;
    }));
    toast.success("Correction payment recorded successfully");
  };

  // Filter underpayments based on selected filters and search query
  const filteredItems = underpayments.filter(item => {
    const matchesContractor = filterContractor === "all" || item.contractor === filterContractor;
    const matchesProject = filterProject === "all" || item.projectSite === filterProject;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesSearch = searchQuery === "" || 
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.workClassification.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesContractor && matchesProject && matchesStatus && matchesSearch;
  });

  // Calculate summary statistics
  const totalUnderpayment = filteredItems.reduce((sum, item) => sum + item.underpaymentAmount, 0);
  const totalInterest = filteredItems.reduce((sum, item) => sum + item.interestAmount, 0);
  const totalDue = filteredItems.reduce((sum, item) => sum + item.totalDue, 0);
  const pendingCount = filteredItems.filter(item => item.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Underpayment Corrections</h1>
        <DateSelector onDateChange={handleDateChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Underpayment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalUnderpayment.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalInterest.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Amount Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalDue.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Pending Corrections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="corrected">Corrected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-64">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search employees or classifications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Button variant="outline" onClick={() => {
          setFilterContractor("all");
          setFilterProject("all");
          setFilterStatus("all");
          setSearchQuery("");
        }}>
          Clear Filters
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Underpayment Corrections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Contractor</th>
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-left">Classification</th>
                  <th className="px-4 py-2 text-left">Project Site</th>
                  <th className="px-4 py-2 text-left">Pay Period</th>
                  <th className="px-4 py-2 text-right">Regular Hours</th>
                  <th className="px-4 py-2 text-right">OT Hours</th>
                  <th className="px-4 py-2 text-right">Required Rate</th>
                  <th className="px-4 py-2 text-right">Paid Rate</th>
                  <th className="px-4 py-2 text-right">Underpayment</th>
                  <th className="px-4 py-2 text-left">Original Payment Date</th>
                  <th className="px-4 py-2 text-right">Interest Rate (%)</th>
                  <th className="px-4 py-2 text-right">Interest</th>
                  <th className="px-4 py-2 text-right">Total Due</th>
                  <th className="px-4 py-2 text-left">Correction Date</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-b ${item.status === 'pending' ? "bg-yellow-50" : ""}`}
                  >
                    <td className="px-4 py-2 font-medium">{item.contractor}</td>
                    <td className="px-4 py-2">{item.employeeName}</td>
                    <td className="px-4 py-2">{item.workClassification}</td>
                    <td className="px-4 py-2">{item.projectSite}</td>
                    <td className="px-4 py-2">{item.payPeriod}</td>
                    <td className="px-4 py-2 text-right">{item.regularHours}</td>
                    <td className="px-4 py-2 text-right">{item.overtimeHours}</td>
                    <td className="px-4 py-2 text-right">${item.requiredRate.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${item.paidRate.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${item.underpaymentAmount.toFixed(2)}</td>
                    <td className="px-4 py-2">{new Date(item.originalPaymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">{item.interestRate.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right">${item.interestAmount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-medium">${item.totalDue.toFixed(2)}</td>
                    <td className="px-4 py-2">{item.correctionDate ? new Date(item.correctionDate).toLocaleDateString() : "---"}</td>
                    <td className="px-4 py-2 text-center">
                      {item.status === 'corrected' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Corrected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {item.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCorrection(item.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Record Payment
                        </Button>
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

export default UnderpaymentCorrections;