'use client';

import React from "react";
import MapView from "./components/MapView";

export default function ProjectsClient() {
  return (
    <div className="max-w-7xl p-1 md:p-2 mx-auto space-y-4">
      <header>
        <h1 className="text-4xl">Project Map</h1>
      </header>
      
      <MapView />
    </div>
  );
}