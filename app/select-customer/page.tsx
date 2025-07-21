'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import { type Customer } from '@/lib/types';
import { CustomerSelect } from './components/customer-select';
import { api } from '@/lib/api';
import { type UserInfoResponse } from '@/lib/types';

export default function SelectCustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    console.log('on customer account selection page');
    const storedUser = getStoredUser();
    console.log('user email: ', storedUser?.email);
    if (!storedUser) {
      console.log('no stored user');
      router.push('/');
      return;
    }
    localStorage.removeItem('selected_site');

    const fetchCustomers = async () => {
      try {
        const userInfo = await api.post<UserInfoResponse>('/v2/user/info/', {});
        if (userInfo && userInfo.customers) {
          setCustomers(userInfo.customers);
        } else {
          // Handle case where customers are not returned
          console.error('No customers found for this user.');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        router.push('/');
      }
    };

    fetchCustomers();
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