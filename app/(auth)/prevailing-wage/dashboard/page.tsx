'use client'
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateSelector from "@/components/selectors/DateSelector";
import ProjectsList from "@/app/(auth)/prevailing-wage/components/ProjectList";
import QuarterlySummary from "@/app/(auth)/prevailing-wage/components/QuarterlySummary";
import { Project, Contractor, QuarterlySummaryItem } from "@/app/(auth)/prevailing-wage/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BASE_URL, defaultHeaders } from "@/lib/api";

// Sample mock data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "GreenFlame BioEnergy",
    state: "CA",
    county: "Los Angeles",
    contractors: [
      {
        id: "101",
        name: "ABC Construction",
        wageClassification: "Electrician",
        constructionType: "Commercial",
        baseRate: 45.75,
        fringeRate: 12.50,
        iraRequestDate: "2023-01-15",
        wdApprovalDate: "2023-02-01",
        isNewRate: true,
        expirationDate: "2023-08-01",
        daysValid: 180
      }
    ]
  }
];

const mockOperationalData: QuarterlySummaryItem[] = [
  {
    contractor: "XYZ Maintenance",
    projectSite: "GreenFlame BioEnergy",
    quarter: "Q1 2023",
    description: "Facility maintenance",
    actionTaken: "Documents received",
    payDate: "2023-03-15",
    lastActionDate: "2023-03-20"
  },
  {
    contractor: "Tech Services Inc.",
    projectSite: "Green Valley",
    quarter: "Q1 2023",
    description: "Electrical maintenance",
    actionTaken: "Reminder sent",
    payDate: "2023-03-10",
    lastActionDate: "2023-03-25"
  }
];

const mockConstructionData: QuarterlySummaryItem[] = [
  {
    contractor: "ABC Construction",
    projectSite: "GreenFlame BioEnergy",
    quarter: "Q1 2023",
    description: "Building expansion",
    actionTaken: "Documents received",
    payDate: "2023-03-12",
    lastActionDate: "2023-03-18"
  },
  {
    contractor: "Builders United",
    projectSite: "Riverfront",
    quarter: "Q1 2023",
    description: "New installation",
    actionTaken: "Pending submission",
    payDate: "2023-03-05",
    lastActionDate: "2023-03-22"
  }
];

const PrevailingWage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [operationalData, setOperationalData] = useState<QuarterlySummaryItem[]>(mockOperationalData);
  const [constructionData, setConstructionData] = useState<QuarterlySummaryItem[]>(mockConstructionData);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // In a real application, we would fetch data for the selected date
    toast.info(`Data updated for ${date.toLocaleDateString()}`);
  };

  const handleAddProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const handleAddContractor = (projectId: string, contractor: Contractor) => {
    setProjects(projects.map((project) => {
      if (project.id === projectId) {
        return {
          ...project,
          contractors: [...project.contractors, contractor]
        };
      }
      return project;
    }));
  };

  const handleDownload = async () => {
    // TODO: Implement download The extracted information should include data from all Prevailing Wage sub-menus, with each sub-menu's data placed in a separate sheet.

    return;
    try {
      setIsDownloading(true);
      const response = await fetch(`${BASE_URL}/v2/prevailing-wage/download/`, {
        method: 'POST',
        headers: {...defaultHeaders},
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          projects: projects,
          operational: operationalData,
          construction: constructionData
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prevailing-wage-report-${selectedDate.toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Prevailing Wage Dashboard</h1>
        <div className="flex gap-4">
          <DateSelector onDateChange={handleDateChange} />
          <Button 
            // variant="outline" 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download Report'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="projects">List of Projects</TabsTrigger>
          <TabsTrigger value="summary">Quarterly Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-6">
          <ProjectsList 
            projects={projects} 
            onAddProject={handleAddProject}
            onAddContractor={handleAddContractor}
          />
        </TabsContent>
        
        <TabsContent value="summary" className="mt-6">
          <QuarterlySummary 
            operational={operationalData} 
            construction={constructionData} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrevailingWage;