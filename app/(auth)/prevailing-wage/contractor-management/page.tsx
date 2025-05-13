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
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Users, Search, Mail, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import DateSelector from "@/components/selectors/DateSelector";
import { toast } from "sonner";

interface ContractorInfo {
  id: string;
  name: string;
  trades: string[];
  projects: string[];
  totalHours: number;
  apprenticeHours: number;
  apprenticePercentage: number;
  lastSubmission: string;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  contactEmail: string;
  phoneNumber: string;
  address: string;
}

const ContractorManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTrade, setFilterTrade] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Mock data for contractors
  const [contractors, setContractors] = useState<ContractorInfo[]>([
    {
      id: "1",
      name: "ABC Construction",
      trades: ["Electrical", "Plumbing"],
      projects: ["Acme RNG", "Green Valley"],
      totalHours: 1240,
      apprenticeHours: 248,
      apprenticePercentage: 20,
      lastSubmission: "2023-04-01",
      complianceStatus: 'compliant',
      contactEmail: "contact@abcconstruction.com",
      phoneNumber: "(555) 123-4567",
      address: "123 Main St, Anytown, CA 12345"
    },
    {
      id: "2",
      name: "XYZ Plumbing",
      trades: ["Plumbing"],
      projects: ["Green Valley"],
      totalHours: 620,
      apprenticeHours: 62,
      apprenticePercentage: 10,
      lastSubmission: "2023-04-01",
      complianceStatus: 'warning',
      contactEmail: "info@xyzplumbing.com",
      phoneNumber: "(555) 987-6543",
      address: "456 Oak Ave, Somewhere, CA 54321"
    },
    {
      id: "3",
      name: "Smith Carpentry",
      trades: ["Carpentry"],
      projects: ["Acme RNG"],
      totalHours: 440,
      apprenticeHours: 110,
      apprenticePercentage: 25,
      lastSubmission: "2023-03-25",
      complianceStatus: 'compliant',
      contactEmail: "office@smithcarpentry.com",
      phoneNumber: "(555) 456-7890",
      address: "789 Elm St, Elsewhere, CA 67890"
    },
    {
      id: "4",
      name: "Green Landscaping",
      trades: ["Landscaping"],
      projects: ["Acme RNG", "Riverfront"],
      totalHours: 320,
      apprenticeHours: 0,
      apprenticePercentage: 0,
      lastSubmission: "2023-03-18",
      complianceStatus: 'non-compliant',
      contactEmail: "admin@greenlandscaping.com",
      phoneNumber: "(555) 345-6789",
      address: "321 Pine Rd, Nowhere, CA 43210"
    }
  ]);

  // Available trades and projects for filtering
  const allTrades = Array.from(new Set(contractors.flatMap(contractor => contractor.trades)));
  const allProjects = Array.from(new Set(contractors.flatMap(contractor => contractor.projects)));

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    toast.info(`Data filtered for ${date.toLocaleDateString()}`);
  };

  const handleSendReminder = (contractor: ContractorInfo) => {
    toast.success(`Reminder sent to ${contractor.name} at ${contractor.contactEmail}`);
  };

  // Filter contractors based on selected filters and search query
  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = searchQuery === "" || 
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrade = filterTrade === "all" || contractor.trades.includes(filterTrade);
    const matchesProject = filterProject === "all" || contractor.projects.includes(filterProject);
    const matchesStatus = filterStatus === "all" || contractor.complianceStatus === filterStatus;
    
    return matchesSearch && matchesTrade && matchesProject && matchesStatus;
  });

  // Calculate summary statistics
  const totalContractors = filteredContractors.length;
  const compliantCount = filteredContractors.filter(c => c.complianceStatus === 'compliant').length;
  const warningCount = filteredContractors.filter(c => c.complianceStatus === 'warning').length;
  const nonCompliantCount = filteredContractors.filter(c => c.complianceStatus === 'non-compliant').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Contractor Management</h1>
        <DateSelector onDateChange={handleDateChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalContractors}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{compliantCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{nonCompliantCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-64">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search contractors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={filterTrade} onValueChange={setFilterTrade}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Trade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              {allTrades.map((trade) => (
                <SelectItem key={trade} value={trade}>{trade}</SelectItem>
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
              {allProjects.map((project) => (
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
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={() => {
          setSearchQuery("");
          setFilterTrade("all");
          setFilterProject("all");
          setFilterStatus("all");
        }}>
          Clear Filters
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {filteredContractors.map((contractor) => (
          <Card key={contractor.id} className={
            contractor.complianceStatus === 'non-compliant' ? "border-red-200" : 
            contractor.complianceStatus === 'warning' ? "border-yellow-200" : 
            "border-green-200"
          }>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <CardTitle>{contractor.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Last Submission: {contractor.lastSubmission}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contractor.complianceStatus === 'compliant' ? "bg-green-100 text-green-800" :
                    contractor.complianceStatus === 'warning' ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {contractor.complianceStatus === 'compliant' ? "Compliant" :
                     contractor.complianceStatus === 'warning' ? "Warning" :
                     "Non-Compliant"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Trades</p>
                  <p>{contractor.trades.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Projects</p>
                  <p>{contractor.projects.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p>{contractor.contactEmail}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Apprentice Hours: {contractor.apprenticeHours} of {contractor.totalHours} hours</span>
                  <span>{contractor.apprenticePercentage}% of required 15%</span>
                </div>
                <Progress 
                  value={contractor.apprenticePercentage} 
                  className={contractor.apprenticePercentage >= 15 ? "bg-green-100" : "bg-yellow-100"}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{contractor.name} - Contractor Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Contact Email</p>
                          <p className="text-sm">{contractor.contactEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Phone Number</p>
                          <p className="text-sm">{contractor.phoneNumber}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm">{contractor.address}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Apprentice Hours Progress</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Apprentice Hours: {contractor.apprenticeHours} of {contractor.totalHours} hours</span>
                            <span>{contractor.apprenticePercentage}% of required 15%</span>
                          </div>
                          <Progress 
                            value={contractor.apprenticePercentage} 
                            className={contractor.apprenticePercentage >= 15 ? "bg-green-100" : "bg-yellow-100"}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Projects</p>
                        <div className="flex flex-wrap gap-2">
                          {contractor.projects.map(project => (
                            <span key={project} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {project}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Trades</p>
                        <div className="flex flex-wrap gap-2">
                          {contractor.trades.map(trade => (
                            <span key={trade} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {trade}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => handleSendReminder(contractor)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button variant="default" onClick={() => handleSendReminder(contractor)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContractorManagement;