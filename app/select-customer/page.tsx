'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import { type Customer } from '@/lib/types';
import { CustomerSelect } from './components/customer-select';

export default function SelectCustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    console.log('on customer account selection page');
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const storedCustomers = localStorage.getItem('login_customers');
    if (storedCustomers) {
      try {
        const parsedCustomers = JSON.parse(storedCustomers);
        setCustomers(parsedCustomers);
      } catch (error) {
        console.error('Error parsing stored customers:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!customers) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <CustomerSelect customers={customers} />;
}