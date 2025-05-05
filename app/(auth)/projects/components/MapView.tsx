'use client';

import { useRef, useState, useEffect } from 'react';
import { TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, BarChart, FileText, Scale } from "lucide-react";
import { projectsData } from './ProjectData';
import { toast } from "sonner";
import L from 'leaflet';
import { getStoredCustomer } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom icon for our markers
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

interface Site {
  plant_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  image_url: string;
  summary: string;
}

const MapView = () => {
  const [selectedSites, setSelectedSites] = useState<Site[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerSites, setCustomerSites] = useState<Site[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Get customer name from localStorage and filter sites
  useEffect(() => {
    // Get customer name from localStorage
    const currentCustomer = getStoredCustomer();
    const customerName = currentCustomer?.name || "Demo-RNG";
    console.log("currentCustomer", customerName);
    setCustomerName(customerName);
    
    // Filter sites for the customer
    let filteredSites: Site[] = [];
    
    if (customerName === "RNG Plant Portfolio") {
      // Get all sites from all customers
      filteredSites = getAllSitesFromData();
    } else {
      // Find customer by name and get their sites
      const customerData = findCustomerByName(customerName);
      
      if (customerData && customerData.sites) {
        filteredSites = customerData.sites as Site[];
      }
    }
    
    console.log("filteredSites", filteredSites);
    setCustomerSites(filteredSites);
  }, []);

  // Helper function to find a customer by name
  const findCustomerByName = (customerName: string): any => {
    return projectsData.find(customer => customer.customer === customerName) || null;
  };

  // Helper function to get all sites from all customers
  const getAllSitesFromData = (): Site[] => {
    let allSites: Site[] = [];
    
    // Iterate through each customer and add their sites
    projectsData.forEach(customer => {
      if (customer.sites && Array.isArray(customer.sites)) {
        allSites = [...allSites, ...customer.sites as Site[]];
      }
    });
    
    return allSites;
  };

  // Initialize map on component mount - only after we have customer sites
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || customerSites.length === 0) return;
    
    console.log("Creating map with sites:", customerSites);
    
    // Create map instance
    const map = L.map(mapContainer.current).setView([37.0902, -95.7129], 3.5);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Define the location counter explicitly as an object
    const locationCounts: {[key: string]: number} = {};
    
    // First pass: count sites at each location
    customerSites.forEach(site => {
      if (site.latitude === undefined || site.longitude === undefined) {
        return;
      }
      
      // Create a key for this location - ensure numbers are valid
      const key = `${Number(site.latitude).toFixed(5)},${Number(site.longitude).toFixed(5)}`;
      
      // Initialize or increment the count for this location
      if (!locationCounts[key]) {
        locationCounts[key] = 1;
      } else {
        locationCounts[key] += 1;
      }
    });
    
    // Create a map to track which locations have already had count indicators added
    const countIndicatorsAdded = new Set<string>();
    
    // Add each site with its own marker
    customerSites.forEach(site => {
      if (site.latitude === undefined || site.longitude === undefined) {
        console.warn(`Site ${site.plant_name} has invalid coordinates`, site);
        return;
      }
      
      // Create a key for this location
      const key = `${Number(site.latitude).toFixed(5)},${Number(site.longitude).toFixed(5)}`;
      
      // Get the count for this location
      const locationCount = locationCounts[key];
      
      // Calculate index of this site at this location for offset calculation
      const siteIndex = customerSites
        .filter(s => 
          s.latitude !== undefined && 
          s.longitude !== undefined && 
          `${Number(s.latitude).toFixed(5)},${Number(s.longitude).toFixed(5)}` === key
        )
        .findIndex(s => s.plant_name === site.plant_name);
      
      // Calculate position - add offset if this is not the first marker at this location
      let markerLat = Number(site.latitude);
      let markerLng = Number(site.longitude);
      
      if (locationCount > 1 && siteIndex > 0) {
        // Use a larger, more visible offset
        const offsetAmount = 0.05; // Increased for visibility
        const angle = (siteIndex * Math.PI * 2) / 8;
        const offsetLat = Math.sin(angle) * offsetAmount;
        const offsetLng = Math.cos(angle) * offsetAmount;
        
        markerLat += offsetLat;
        markerLng += offsetLng;
      }
      
      // Create and add the marker
      try {
        const marker = L.marker([markerLat, markerLng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div class="text-center">
              <strong>${site.plant_name}</strong><br />
              ${site.city}, ${site.state}
            </div>
          `);
        
        // Set up click handler
        marker.on('click', () => {
          console.log(`Clicked on ${site.plant_name}`);
          setSelectedSites([site]);
          setActiveIndex(0);
          toast(`Viewing ${site.plant_name}`);
          
          // Call handleSiteChange function when a site is selected
          handleSiteChange(site);
        });
        
        // If this location has multiple sites and we haven't added a count indicator yet, add one
        if (locationCount > 1 && !countIndicatorsAdded.has(key)) {
          // Create a custom div icon to show the count
          const countIcon = L.divIcon({
            html: `<div style="background-color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc; color: red; font-weight: bold; font-size: 12px;">${locationCount}</div>`,
            className: 'count-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          // Add the count indicator at the original (non-offset) location
          L.marker([Number(site.latitude), Number(site.longitude)], { icon: countIcon })
            .addTo(map)
            .bindTooltip(`${locationCount} sites at this location`);
          
          // Mark this location as having a count indicator
          countIndicatorsAdded.add(key);
        }
      } catch (error) {
        console.error(`Error adding marker for ${site.plant_name}:`, error);
      }
    });
    
    mapRef.current = map;
    
    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [customerSites]);

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([37.0902, -95.7129], 3.5);
      setSelectedSites([]);
      setActiveIndex(0);
    }
  };
  
  const handleNextSite = () => {
    if (selectedSites.length > 1) {
      setActiveIndex((prev) => (prev + 1) % selectedSites.length);
    }
  };
  
  const handlePrevSite = () => {
    if (selectedSites.length > 1) {
      setActiveIndex((prev) => (prev - 1 + selectedSites.length) % selectedSites.length);
    }
  };

  // Add this function inside the MapView component
  const handleSiteChange = (site: Site) => {
    // Store only the site name in local storage
    localStorage.setItem('selected_site', JSON.stringify({ name: site.plant_name }));
    console.log(`Switched to site: ${site.plant_name}`);
    
    // Emit a custom event for site change
    const siteChangeEvent = new CustomEvent('siteChange', { 
      detail: { site } 
    });
    window.dispatchEvent(siteChangeEvent);
    
    // Trigger a dropdown selection event for the navbar
    const navbarSiteChangeEvent = new CustomEvent('navbarSiteChange', {
      detail: { siteName: site.plant_name }
    });
    window.dispatchEvent(navbarSiteChangeEvent);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Interactive Map</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
            Total Sites: {customerSites.length}
          </span>
          {selectedSites.length > 0 && (
            <Button variant="outline" onClick={handleResetView}>
              Reset View
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div 
          ref={mapContainer}
          className="relative h-[70vh] w-full md:w-2/3 rounded-lg overflow-hidden shadow-lg border border-gray-200"
        />

        {/* Site information card */}
        {selectedSites.length > 0 ? (
          <Card className="animate-fade-in w-full md:w-1/3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                <CardTitle>{selectedSites[activeIndex].plant_name}</CardTitle>
              </div>
              <CardDescription>{selectedSites[activeIndex].city}, {selectedSites[activeIndex].state}</CardDescription>
              
              {selectedSites.length > 1 && (
                <div className="flex items-center justify-between mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevSite}
                    disabled={selectedSites.length <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Site {activeIndex + 1} of {selectedSites.length}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextSite}
                    disabled={selectedSites.length <= 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-48 overflow-hidden rounded-md">
                <img 
                  src={selectedSites[activeIndex].image_url} 
                  alt={selectedSites[activeIndex].plant_name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                  }}
                />
              </div>
              <p className="text-gray-700">{selectedSites[activeIndex].summary}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center p-2 h-auto border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => router.push('/reporting/rng-mass-balance')}
                >
                  <Scale className="h-4 w-4 mb-1" />
                  <span className="text-xs">Mass Balance</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center p-2 h-auto border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => router.push('/reporting/air-permits')}
                >
                  <FileText className="h-4 w-4 mb-1" />
                  <span className="text-xs">Air Permit</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center p-2 h-auto border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => router.push('/reporting/analytics')}
                >
                  <BarChart className="h-4 w-4 mb-1" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="hidden md:block md:w-1/3">
            <Card className="h-full flex items-center justify-center text-gray-500 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <MapPin className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-center">Select a location on the map to view details</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
