'use client';

import React from "react";
import MapView from "./components/MapView";

export default function ProjectsClient() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-gray-950">All Projects</h1>
        </header>
        
        <MapView />
      </div>
    </div>
  );
}