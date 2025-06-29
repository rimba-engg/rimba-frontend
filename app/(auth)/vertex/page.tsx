"use client";

import { Thread } from "@/app/(auth)/vertex/components/thread";
import { StreamProvider } from "@/app/(auth)/vertex/providers/Stream";
import { ThreadProvider } from "@/app/(auth)/vertex/providers/Thread";
import { Toaster } from "@/app/(auth)/vertex/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";

export default function DemoPage(): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <NuqsAdapter>
        <Toaster />
        <ThreadProvider>
          <StreamProvider>
            <Thread />
          </StreamProvider>
        </ThreadProvider>
      </NuqsAdapter>
    </React.Suspense>
  );
}
