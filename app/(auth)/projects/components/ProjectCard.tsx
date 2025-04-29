// 'use client';

// import React from "react";
// import { Project } from "../types/project";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight } from "lucide-react";

// interface ProjectCardProps {
//   project: Project;
//   onClose: () => void;
// }

// const getStatusBadge = (status: Project["status"]) => {
//   switch (status) {
//     case "operational":
//       return <Badge className="bg-green-600">Operational</Badge>;
//     case "construction":
//       return <Badge className="bg-yellow-500">Under Construction</Badge>;
//     case "planned":
//       return <Badge className="bg-blue-500">Planned</Badge>;
//     default:
//       return null;
//   }
// };

// const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClose }) => {
//   return (
//     <Card className="w-full max-w-sm shadow-lg animate-fade-in">
//       <CardHeader className="pb-2">
//         <div className="flex justify-between items-start">
//           <div>
//             <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
//             <CardDescription>{project.location.state}</CardDescription>
//           </div>
//           {getStatusBadge(project.status)}
//         </div>
//       </CardHeader>
//       <CardContent className="pb-4">
//         <div className="aspect-video w-full overflow-hidden rounded-md bg-muted mb-4">
//           <img
//             src={project.imageUrl}
//             alt={project.name}
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <p className="text-sm mb-4">{project.description}</p>
//         <div className="text-xs space-y-1">
//           <div className="flex justify-between">
//             <span className="font-semibold">Contract Date:</span>
//             <span>{project.details.contractDate}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="font-semibold">Construction Date:</span>
//             <span>{project.details.constructionDate}</span>
//           </div>
//           {project.details.commercialOperations && (
//             <div className="flex justify-between">
//               <span className="font-semibold">Commercial Operations:</span>
//               <span>{project.details.commercialOperations}</span>
//             </div>
//           )}
//         </div>
//       </CardContent>
//       <CardFooter>
//         <Button asChild variant="default" className="w-full">
//           <a href={project.moreInfoUrl} target="_blank" rel="noopener noreferrer">
//             More Information
//             <ArrowRight className="ml-2 h-4 w-4" />
//           </a>
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// export default ProjectCard;
