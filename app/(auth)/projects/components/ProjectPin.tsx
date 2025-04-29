// 'use client';

// import React from "react";
// import { MapPin } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Project } from "../types/project";

// interface ProjectPinProps {
//   project: Project;
//   onClick: () => void;
//   isActive: boolean;
// }

// const getStatusColor = (status: Project["status"]) => {
//   switch (status) {
//     case "operational":
//       return "text-green-600";
//     case "construction":
//       return "text-yellow-500";
//     case "planned":
//       return "text-blue-500";
//     default:
//       return "text-gray-500";
//   }
// };

// const ProjectPin: React.FC<ProjectPinProps> = ({ project, onClick, isActive }) => {
//   return (
//     <div 
//       className={cn(
//         "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group",
//         "transition-all duration-300 z-10",
//         isActive ? "scale-125 z-20" : "hover:scale-110",
//       )}
//       style={{ 
//         left: `${project.location.lng}%`, 
//         top: `${project.location.lat}%` 
//       }}
//       onClick={onClick}
//       data-testid={`pin-${project.id}`}
//     >
//       <div className="relative">
//         <MapPin 
//           size={32} 
//           className={cn(
//             getStatusColor(project.status),
//             "drop-shadow-md",
//             isActive ? "animate-pulse-gentle" : "",
//           )} 
//           fill={isActive ? "currentColor" : "transparent"} 
//           strokeWidth={isActive ? 2.5 : 2}
//         />
//         <div className="absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white/90 px-2 py-1 rounded text-xs -top-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
//           {project.name}
//           <br />
//           <span className="text-gray-600">{project.location.state}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectPin;
