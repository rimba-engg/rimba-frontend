'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, getStoredCustomer } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    const customer = getStoredCustomer();
    if (user) {
      console.log("user logged in", user);
      if (customer) {
        console.log("customer selected", customer);
        if (customer.is_rng_customer)
          router.push('/reporting/rng-mass-balance');  
        else
          router.push('/library/documents');  
      } else {
        console.log('user needs to select a customer account');
        router.push('/select-customer');  
      }
    } else {
      console.log('no user logged in');
      router.push('/login');
    }
  }, [router]);

  // Return a loading state while checking auth
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}