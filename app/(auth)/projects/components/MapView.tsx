'use client';

import { useRef, useState, useEffect } from 'react';
import { TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";
import { projectsData } from './ProjectData';
import { toast } from "sonner";
import L from 'leaflet';
import { getStoredCustomer } from '@/lib/auth';

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
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerSites, setCustomerSites] = useState<Site[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  // Get customer name from localStorage and filter sites
  useEffect(() => {
    // Get customer name from localStorage
    const currentCustomer = getStoredCustomer();
    const customerName = currentCustomer?.name || "RNG Plant Portfolio";
    console.log("currentCustomer", customerName);
    setCustomerName(customerName);
    
    // Filter sites for the customer
    let filteredSites: Site[] = [];
    
    if (customerName === "RNG Plant Portfolio") {
      // Get top-level sites (belonging to RNG Plant Portfolio)
      filteredSites = projectsData.sites
        .filter(site => !site.hasOwnProperty('customer'))
        .map(site => site as Site);
    } else {
      // Look for nested customer sites
      const customerSitesObj = projectsData.sites.find(
        site => 'customer' in site && site['customer'] === customerName
      );
      
      if (customerSitesObj && 'sites' in customerSitesObj) {
        filteredSites = customerSitesObj.sites as Site[];
      }
    }
    
    console.log("filteredSites", filteredSites);
    setCustomerSites(filteredSites);
  }, []);

  // Initialize map on component mount - only after we have customer sites
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || customerSites.length === 0) return;
    
    // Create map instance
    const map = L.map(mapContainer.current).setView([37.0902, -95.7129], 3.5);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for each site
    customerSites.forEach(site => {
      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<div class="text-center"><strong>${site.plant_name}</strong><br />${site.city}, ${site.state}</div>`);
      
      marker.on('click', () => {
        setSelectedSite(site);
        toast(`Viewing ${site.plant_name}`);
      });
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
      setSelectedSite(null);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{customerName} Map</h2>
        {selectedSite && (
          <Button variant="outline" onClick={handleResetView}>
            Reset View
          </Button>
        )}
      </div>
      
      <div 
        ref={mapContainer}
        className="relative h-[70vh] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200"
      />

      {/* Site information card */}
      {selectedSite && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <CardTitle>{selectedSite.plant_name}</CardTitle>
            </div>
            <CardDescription>{selectedSite.city}, {selectedSite.state}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative h-48 overflow-hidden rounded-md">
              <img 
                src={selectedSite.image_url} 
                alt={selectedSite.plant_name}
                className="w-full h-full object-cover"
                // onError={(e) => {
                //   (e.target as HTMLImageElement).src = "";
                // }}
              />
            </div>
            <p className="text-gray-700">{selectedSite.summary}</p>
          </CardContent>
          <CardFooter>
            <Button className="flex items-center gap-2 w-full">
              More Information
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default MapView;
