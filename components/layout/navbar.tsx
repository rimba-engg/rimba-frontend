'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notifications } from './notifications';
import { HelpCircle } from 'lucide-react';
import { getStoredUser, getStoredCustomer } from '@/lib/auth';
import { api } from '@/lib/api';
import { type User, type Customer  } from '@/lib/types';
import { useAuth0 } from '@auth0/auth0-react';
import { DemoRNGSites, NovillaSites } from '@/config/rngSites';
import { trackProjectChange, trackProjectDropdownOpen } from '@/lib/mixpanel';


export function Navbar() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const { logout } = useAuth0();

  const [sites, setSites] = useState([
    { name: 'GreenFlame BioEnergy' },
  ]);
  const [selectedSite, setSelectedSite] = useState(sites[0]);
  
  // Define the Site type based on our state structure
  interface Site {
    name: string;
  }
  
  useEffect(() => {
    // Load user and customer data after component mounts to avoid hydration mismatch
    setUserData(getStoredUser());
    setCustomerData(getStoredCustomer());
    
    // Load selected site from local storage if available
    const storedSite = localStorage.getItem('selected_site');
    if (storedSite) {
      const parsedSite = JSON.parse(storedSite);
      // Find the site in our sites array
      const siteExists = sites.find(site => site.name === parsedSite.name);
      if (siteExists) {
        setSelectedSite(siteExists);
      }
    }
  }, []);

  useEffect(() => {
    console.log('customerData', customerData);
    if (customerData?.name === 'Novilla') {
      
      setSites(NovillaSites);
      var current_site = localStorage.getItem('selected_site');
      if (current_site) {
        setSelectedSite(JSON.parse(current_site));
      } else {
        localStorage.setItem('selected_site', JSON.stringify({ name: 'West Branch' }));
        setSelectedSite({ name: 'West Branch' });
        // Emit a custom event for site change
        const siteChangeEvent = new CustomEvent('siteChange', { 
          detail: { site: { name: 'West Branch' } }
        });
        window.dispatchEvent(siteChangeEvent);
      }
    }
    else if (customerData?.name === 'Demo-RNG') {
      setSites(DemoRNGSites);
      var current_site = localStorage.getItem('selected_site');
      if (current_site) {
        setSelectedSite(JSON.parse(current_site));
      } else {
        setSelectedSite({ name: 'GreenFlame BioEnergy' });
        localStorage.setItem('selected_site', JSON.stringify({ name: 'GreenFlame BioEnergy' }));
        const siteChangeEvent = new CustomEvent('siteChange', { 
          detail: { site: { name: 'GreenFlame BioEnergy' } }
        });
        window.dispatchEvent(siteChangeEvent);
      }
    }
    else if (customerData?.name === 'Kinder Morgan') {
      setSites([
        { name: 'Arlington RNG' },
        {name: 'Autumn Hills RNG'},
        {name: 'Hartland Landfill RNG'},
        {name: 'Indy High BTU RNG'}
      ]);
      var current_site = localStorage.getItem('selected_site');
      if (current_site) {
        setSelectedSite(JSON.parse(current_site));
      } else {
        setSelectedSite({ name: 'Arlington RNG' });
        localStorage.setItem('selected_site', JSON.stringify({ name: 'Arlington RNG' }));
      }
    }
  }, [customerData]);

  useEffect(() => {
    // Function to handle the site change event from MapView
    const handleNavbarSiteChange = (event: CustomEvent) => {
      const siteName = event.detail.siteName;
      // Find the site in the current sites array
      const siteFound = sites.find(site => site.name === siteName);
      
      if (siteFound) {
        // Update the selected site if found
        setSelectedSite(siteFound);
      } else if (sites.length > 0) {
        // If site not found in the dropdown, select the first available site
        setSelectedSite(sites[0]);
        localStorage.setItem('selected_site', JSON.stringify({ name: sites[0].name }));
        console.log(`Site ${siteName} not found, defaulting to ${sites[0].name}`);
      }
    };

    // Add event listener
    window.addEventListener('navbarSiteChange', handleNavbarSiteChange as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('navbarSiteChange', handleNavbarSiteChange as EventListener);
    };
  }, [sites]);

  const handleLogout = async () => {
    await api.logout();
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleProfile = () => {
    console.log('Navigate to profile page');
  };

  const handleSwitchAccount = () => {
    // Keep user data but remove customer selection
    localStorage.removeItem('selected_customer');
    router.push('/select-customer');
  };

  const handleSiteChange = (site: { name: string }) => {
    const previousSite = selectedSite.name;
    
    // Track the change in Mixpanel before updating state
    if (userData && customerData && previousSite !== site.name) {
      trackProjectChange(
        userData.id,
        userData.email,
        customerData.name,
        previousSite,
        site.name
      );
    }
    
    setSelectedSite(site);
    localStorage.setItem('selected_site', JSON.stringify({ name: site.name }));
    
    // Notify other components about the site change
    const siteChangeEvent = new CustomEvent('siteChange', {
      detail: { site: { plant_name: site.name } }
    });
    window.dispatchEvent(siteChangeEvent);
  };

  return (
    <header className="h-14 border-b bg-card px-4 flex items-center justify-between">
      <div className="flex w-full justify-between items-center gap-2">
        <DropdownMenu onOpenChange={(open) => {
          // Track dropdown open event
          if (open && userData && customerData) {
            trackProjectDropdownOpen(
              userData.id,
              userData.email,
              customerData.name,
              sites.map(site => site.name)
            );
          }
        }}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{selectedSite.name}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {sites.map((site) => (
              <DropdownMenuItem 
                key={site.name} 
                onClick={() => handleSiteChange(site)}
                className={selectedSite.name === site.name ? "bg-muted" : ""}
              >
                {site.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Link href="/support" className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Support</span>
          </Link>
          <Notifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors">
                <img
                  src={userData?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                {userData && (
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      {userData.first_name} {userData.last_name}
                    </div>
                    {customerData && (
                      <div className="text-xs text-muted-foreground">
                        {customerData.name}
                      </div>
                    )}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleProfile}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSwitchAccount}>
                Switch Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}