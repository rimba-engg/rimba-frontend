'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Standard {
  name: string;
  description: string;
  progress: number;
  target: string;
  status: 'on-track' | 'at-risk' | 'behind';
  isActive: boolean;
  metadata?: {
    type: string;
    region: string;
  };
  imageUrl: string;
  officialLink: string;
  requirementsPath?: string;
}

const standards: Standard[] = [
  {
    name: "California Low Carbon Fuel Standard (LCFS)",
    description: "Sets declining carbon‑intensity limits for transport fuels; credits generated/retired to prove compliance.",
    progress: 78,
    target: "2025",
    status: "on-track",
    isActive: true,
    metadata: {
      type: "Fuel Standard",
      region: "California"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//CARB.png",
    officialLink: "https://ww2.arb.ca.gov/our-work/programs/low-carbon-fuel-standard",
    requirementsPath: "/standards/requirements"
  },
  {
    name: "EPA - RFS",
    description: "Federal mandate for renewable fuel volumes, tracked with Renewable Identification Numbers (RINs).",
    progress: 65,
    target: "2025",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Fuel Standard",
      region: "Federal"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//EPA.png",
    officialLink: "https://www.epa.gov/renewable-fuel-standard-program"
  },
  {
    name: "ISCC EU/PLUS",
    description: "Global chain‑of‑custody scheme accepted by EU and many national biofuel laws.",
    progress: 92,
    target: "2024",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Certification",
      region: "Global"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//ISCC.png",
    officialLink: "https://www.iscc-system.org"
  },
  {
    name: "CORSIA",
    description: "Requires airlines to offset growth in CO₂ from international flights using approved units starting 2024.",
    progress: 45,
    target: "2026",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Aviation",
      region: "Global"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//CORSIA.png",
    officialLink: "https://www.icao.int/environmental-protection/CORSIA/Pages/default.aspx"
  },
  {
    name: 'Canadian CFR',
    description: "A national rule that forces gasoline and diesel suppliers to ratchet down lifecycle carbon‑intensity",
    progress: 0,
    target: '2024',
    status: "behind",
    isActive: false,
    metadata: {
      type: "Fuel Standard",
      region: "Canada"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//Canada_clean_fuels.webp",
    officialLink: "https://www.canada.ca/en/environment-climate-change/services/managing-pollution/energy-production/fuel-regulations/clean-fuel-regulations.html"
  },
  {
    name: "Cap-and-Trade Program",
    description: "California's market-based approach to reducing greenhouse gas emissions across multiple sectors.",
    progress: 0,
    target: "2025",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Climate Program",
      region: "California"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//CARB.png",
    officialLink: "https://ww2.arb.ca.gov/our-work/programs/cap-and-trade-program"
  },
  {
    name: "Advanced Clean Cars Program",
    description: "A suite of standards to reduce smog-forming emissions and greenhouse gases from cars and light trucks.",
    progress: 0,
    target: "2025",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Vehicle Standard",
      region: "California"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//CARB.png",
    officialLink: "https://ww2.arb.ca.gov/our-work/programs/advanced-clean-cars-program"
  },
  {
    name: "Advanced Clean Trucks",
    description: "Regulation to transition medium- and heavy-duty trucks to zero-emission vehicles.",
    progress: 0,
    target: "2025",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Vehicle Standard",
      region: "California"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//CARB.png",
    officialLink: "https://ww2.arb.ca.gov/our-work/programs/advanced-clean-trucks"
  },
  {
    name: "Advanced Clean Fleets",
    description: "Aims to accelerate the adoption of zero-emission vehicles in public and private fleets.",
    progress: 0,
    target: "2025",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Fleet Program",
      region: "California"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//CARB.png",
    officialLink: "https://ww2.arb.ca.gov/our-work/programs/advanced-clean-fleets"
  },
  {
    name: "SB 375",
    description: "Sustainable Communities and Climate Protection Act to reduce greenhouse gas emissions through coordinated transportation and land use planning.",
    progress: 0,
    target: "2025",
    status: "on-track",
    isActive: false,
    metadata: {
      type: "Climate Program",
      region: "California"
    },
    imageUrl: "https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/rimba-website-assets//CARB.png",
    officialLink: "https://ww2.arb.ca.gov/our-work/programs/sustainable-communities-climate-protection-program"
  }
];

export default function StandardsPage() {
  const router = useRouter();
  const activeStandards = standards.filter(s => s.isActive);
  const availableStandards = standards.filter(s => !s.isActive);

  const handleCardClick = (standard: Standard) => {
    if (standard.requirementsPath) {
      router.push(standard.requirementsPath);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold">Regulatory Credit Programs</h1>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="my-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeStandards.map((standard) => (
              <Card 
                key={standard.name} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCardClick(standard)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={standard.imageUrl}
                        alt={`${standard.name} logo`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex justify-between items-center">
                        <span>{standard.name}</span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent onClick={(e) => {e.stopPropagation(); router.push(standard.requirementsPath!);}}>
                  <p className="text-gray-600 mb-4">{standard.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{standard.progress}%</span>
                    </div>
                    <Progress value={standard.progress} className="h-2" />
                    <div className="text-sm text-gray-500">
                      Target Year: {standard.target}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableStandards.map((standard) => (
              <Card key={standard.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={standard.imageUrl}
                        alt={`${standard.name} logo`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{standard.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {standard.metadata?.type}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {standard.metadata?.region}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">{standard.description}</p>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => window.open(standard.officialLink, '_blank')}>
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
