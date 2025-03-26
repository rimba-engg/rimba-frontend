'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notifications } from './notifications';
import { getStoredUser, getStoredCustomer } from '@/lib/auth';
import { api } from '@/lib/api';
import { type User, type Customer  } from '@/lib/types';
import { useAuth0 } from '@auth0/auth0-react';

export function Navbar() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const { logout } = useAuth0();
  
  useEffect(() => {
    // Load user and customer data after component mounts to avoid hydration mismatch
    setUserData(getStoredUser());
    setCustomerData(getStoredCustomer());
  }, []);

  const handleLogout = () => {
    api.logout();
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

  return (
    <header className="h-14 border-b bg-card px-4 flex items-center justify-between">
      <div className="flex-1 max-w-xl relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-full pl-9 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
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
    </header>
  );
}