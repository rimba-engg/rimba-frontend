'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { getStoredCustomer } from '@/lib/auth';
import { InsightLoader } from '@/components/ui/loader';

export default function Home() {
  const router = useRouter();
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear local storage to avoid any stale tokens
      localStorage.clear();
      console.log('user is not authenticated, redirecting to login');
      loginWithRedirect();
    } else {
      const customer = getStoredCustomer();
      if (customer) {
        console.log("customer selected", customer);
        router.push('/reporting/rng-mass-balance');  
      } else {
        console.log('user needs to select a customer account');
        router.push('/select-customer');  
      }
    }
  }, [router, loginWithRedirect, isAuthenticated]);

  // Return a loading state while checking auth
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <InsightLoader size="default" />
    </div>
  );
}