"use client";
import "@/lib/eventsource";

import { Thread } from "@/app/(auth)/vertex/components/thread";
import { StreamProvider } from "@/app/(auth)/vertex/providers/Stream";
import { ThreadProvider } from "@/app/(auth)/vertex/providers/Thread";
import { ReferencedTextProvider } from "@/app/(auth)/vertex/providers/ReferencedText";
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
            <ReferencedTextProvider>
              <Thread />
            </ReferencedTextProvider>
          </StreamProvider>
        </ThreadProvider>
      </NuqsAdapter>
    </React.Suspense>
  );
}
