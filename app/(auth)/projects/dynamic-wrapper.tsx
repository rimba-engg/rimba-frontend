// 'use client';

// import React from "react";
// import MapView from "./components/MapView";
// import { projects } from "./Data/ProjectData";
// import { Suspense } from "react";

// const ProjectsContent = () => {
//   return (
//     <div className="bg-gray-50">
//       <div className="container mx-auto py-8">
//         <header className="mb-8 text-center">
//           <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">RNG Project Explorer</h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Interactive map of Renewable Natural Gas (RNG) projects across the Midwest.
//             Click on pins to view detailed project information.
//           </p>
//         </header>
        
//         <div className="mb-8">
//           <MapView projects={projects} />
//         </div>

//         <div className="max-w-3xl mx-auto px-4">
//           <h2 className="text-2xl font-bold mb-4 text-gray-900">About RNG Projects</h2>
//           <p className="mb-4 text-gray-700">
//             Our Renewable Natural Gas (RNG) facilities convert agricultural waste into clean, sustainable energy.
//             We currently have projects in various stages across Wisconsin, Michigan, and Iowa.
//           </p>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//             <div className="bg-white p-4 rounded-lg shadow-md">
//               <h3 className="font-bold text-xl text-green-600">Operational</h3>
//               <p className="text-3xl font-bold">2</p>
//               <p className="text-gray-600">Projects producing RNG</p>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-md">
//               <h3 className="font-bold text-xl text-yellow-500">Construction</h3>
//               <p className="text-3xl font-bold">1</p>
//               <p className="text-gray-600">Projects being built</p>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-md">
//               <h3 className="font-bold text-xl text-blue-500">Planned</h3>
//               <p className="text-3xl font-bold">2</p>
//               <p className="text-gray-600">Projects in development</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <footer className="bg-gray-900 text-white py-6 mt-12">
//         <div className="container mx-auto px-4 text-center">
//           <p>&copy; {new Date().getFullYear()} RNG Project Explorer. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// };