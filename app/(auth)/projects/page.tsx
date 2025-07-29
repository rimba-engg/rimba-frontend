'use client';

import React from "react";
import Tabs from "@cloudscape-design/components/tabs";
import MapView from "./components/MapView";
import SummaryView from "./components/SummaryView";

export default function ProjectsClient() {
  return (
    <div className="max-w-7xl p-1 md:p-2 mx-auto space-y-4">
      <Tabs
        tabs={[
          {
            label: "Map",
            id: "map",
            content: <MapView />,
          },
          {
            label: "Summary",
            id: "summary",
            content: <SummaryView />
          },
        ]}
      />
    </div>
  );
}