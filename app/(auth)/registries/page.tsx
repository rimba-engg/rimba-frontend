'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Registry {
  name: string;
  description: string;
  progress: number;
  target: string;
  isActive: boolean;
  metadata?: {
    type: string;
    region: string;
  };
  imageUrl: string;
  officialLink: string;
}

const registries: Registry[] = [
  {
    name: "Verra – Verified Carbon Standard (VCS)",
    description: "Largest voluntary programme; issues Verified Carbon Units (VCUs) for >2,000 projects worldwide.",
    progress: 0,
    target: "2024",
    isActive: false,
    metadata: {
      type: "VCU",
      region: "Global"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//Verra-Logo.png",
    officialLink: "https://verra.org/registry/overview"
  },
  {
    name: "Puro.earth",
    description: "First registry dedicated solely to long‑term carbon‑removal methods (biochar, BECCS, carbonated materials); issues CORCs.",
    progress: 0,
    target: "2024",
    isActive: false,
    metadata: {
      type: "CORC",
      region: "Global"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//puro%20earth.png",
    officialLink: "https://puro.earth"
  },
  {
    name: "Gold Standard",
    description: "NGO‑backed standard that ties carbon credits to sustainable‑development benefits; uses an open 'Impact Registry.'",
    progress: 0,
    target: "2024",
    isActive: false,
    metadata: {
      type: "VER",
      region: "Global"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//gold%20standard.png",
    officialLink: "https://www.goldstandard.org/project-developers/impact-registry"
  },
  {
    name: "American Carbon Registry (ACR)",
    description: "Private registry operating since 1996; credits accepted in some U.S. state programmes and CORSIA.",
    progress: 0,
    target: "2024",
    isActive: false,
    metadata: {
      type: "Mixed",
      region: "US"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//american%20carbon%20registry.jpg",
    officialLink: "https://acrcarbon.org/news/american-carbon-registry-is-now-acr"
  },
  {
    name: "Climate Action Reserve (CAR)",
    description: "Non‑profit issuing Climate Reserve Tonnes (CRTs) under transparent, peer‑reviewed protocols.",
    progress: 0,
    target: "2024",
    isActive: false,
    metadata: {
      type: "CRT",
      region: "US"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//climate%20action%20reserve%20logo.png",
    officialLink: "https://climateactionreserve.org/how/voluntary-offset-program"
  },
  {
    name: "Global Carbon Council (GCC)",
    description: "MENA‑based registry whose ACC credits are eligible for CORSIA and other international buyers.",
    progress: 0,
    target: "2024",
    isActive: false,
    metadata: {
      type: "ACC",
      region: "MENA"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//global%20carbon%20council.png",
    officialLink: "https://www.globalcarboncouncil.com/wp-content/uploads/2021/10/GCC-Program-Manual-v3.1.pdf"
  }
];

export default function RegistriesPage() {
  const activeRegistries = registries.filter(r => r.isActive);
  const availableRegistries = registries.filter(r => !r.isActive);

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold">Voluntary Carbon Programs</h1>
      
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="my-4">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRegistries.map((registry) => (
              <Card key={registry.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={registry.imageUrl}
                        alt={`${registry.name} logo`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{registry.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{registry.progress}%</span>
                    </div>
                    <Progress value={registry.progress} className="h-2" />
                    <div className="text-sm text-gray-500">
                      Target Year: {registry.target}
                    </div>
                    <a 
                      href={registry.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block mt-2"
                    >
                      View Official Documentation →
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableRegistries.map((registry) => (
              <Card key={registry.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={registry.imageUrl}
                        alt={`${registry.name} logo`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{registry.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {registry.metadata?.type}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {registry.metadata?.region}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">{registry.description}</p>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => window.open(registry.officialLink, '_blank')}>
                        Explore
                      </Button>
                      <Button className="flex-1" onClick={() => window.open('https://app.apollo.io/#/meet/rimba', '_blank')}>
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 