'use client';

import React from "react";
import MapView from "./components/MapView";

export default function ProjectsClient() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-primary">RNG Facilities Map</h1>
          <p className="text-xl text-gray-600 mt-2">
            Interactive map of renewable natural gas facilities in the United States
          </p>
        </header>
        
        <MapView />
        
        {/* <footer className="pt-8 border-t border-gray-200 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              <p>© 2025 RNG Plant Portfolio. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <p className="text-sm text-gray-500">Operational: <span className="font-bold">474</span></p>
              <p className="text-sm text-gray-500">Under Construction: <span className="font-bold">155</span></p>
              <p className="text-sm text-gray-500">Planned: <span className="font-bold">285</span></p>
              <p className="text-sm text-gray-500">Total: <span className="font-bold">914</span></p>
            </div>
          </div>
        </footer> */}
      </div>
    </div>
  );
}