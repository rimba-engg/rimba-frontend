import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project, Contractor } from "@/app/(auth)/prevailing-wage/types";
import ProjectForm from "@/app/(auth)/prevailing-wage/components/ProjectForm";
import AddContractorForm from "@/app/(auth)/prevailing-wage/components/AddContractorForm";

interface ProjectsListProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onAddContractor: (projectId: string, contractor: Contractor) => void;
}

const ProjectsList = ({ projects, onAddProject, onAddContractor }: ProjectsListProps) => {
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [contractorFormOpen, setContractorFormOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleOpenContractorForm = (projectId: string) => {
    setSelectedProjectId(projectId);
    setContractorFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects List</h2>
        <Button onClick={() => setProjectFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first project to start tracking prevailing wages.
              </p>
              <Button onClick={() => setProjectFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      {project.state}, {project.county} County
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenContractorForm(project.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Contractor
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {project.contractors.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No contractors added yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Wage Classification</TableHead>
                          <TableHead>Construction Type</TableHead>
                          <TableHead>Base Rate</TableHead>
                          <TableHead>Fringe Rate</TableHead>
                          <TableHead>IRA Request Date</TableHead>
                          <TableHead>WD Approval Date</TableHead>
                          <TableHead>New Rate</TableHead>
                          <TableHead>Expiration</TableHead>
                          <TableHead>Days Valid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.contractors.map((contractor) => (
                          <TableRow key={contractor.id}>
                            <TableCell className="font-medium">{contractor.name}</TableCell>
                            <TableCell>{contractor.wageClassification}</TableCell>
                            <TableCell>{contractor.constructionType}</TableCell>
                            <TableCell>${contractor.baseRate.toFixed(2)}</TableCell>
                            <TableCell>${contractor.fringeRate.toFixed(2)}</TableCell>
                            <TableCell>{contractor.iraRequestDate}</TableCell>
                            <TableCell>{contractor.wdApprovalDate}</TableCell>
                            <TableCell>{contractor.isNewRate ? "Yes" : "No"}</TableCell>
                            <TableCell>{contractor.expirationDate}</TableCell>
                            <TableCell>{contractor.daysValid}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProjectForm 
        open={projectFormOpen} 
        onOpenChange={setProjectFormOpen} 
        onSubmit={onAddProject} 
      />

      <AddContractorForm 
        open={contractorFormOpen}
        onOpenChange={setContractorFormOpen}
        onSubmit={(contractor) => {
          if (selectedProjectId) {
            onAddContractor(selectedProjectId, contractor);
            setContractorFormOpen(false);
          }
        }}
      />
    </div>
  );
};

export default ProjectsList;