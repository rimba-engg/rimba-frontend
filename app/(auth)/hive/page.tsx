"use client";
import "@/lib/eventsource";

import { Thread } from "@/app/(auth)/hive/components/thread";
import { StreamProvider } from "@/app/(auth)/hive/providers/Stream";
import { ThreadProvider } from "@/app/(auth)/hive/providers/Thread";
import { ReferencedTextProvider } from "@/app/(auth)/hive/providers/ReferencedText";
import { Toaster } from "@/app/(auth)/hive/components/ui/sonner";
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
