'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { getStoredCustomer } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
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
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}