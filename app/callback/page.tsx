'use client';
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { getUserInfo, selectCustomer } from '@/lib/auth';
export default function CallbackPage() {
  const { isLoading, isAuthenticated, error, getAccessTokenSilently } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      (async () => {
        try {
          const token = await getAccessTokenSilently();

          // store the token in local storage
          localStorage.setItem('access_token', token);

          // fetch user info from backend
          const {user, customers} = await getUserInfo();

          // save user info in local storage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('all_customers', JSON.stringify(customers));

          // if there is only one customer, select it
          if (customers && customers.length === 1) {
            await selectCustomer(customers[0].id);
          }
          router.push('/'); // redirect after processing
        } catch (err) {
          console.error('Error getting token:', err);
        }
      })();
    }
  }, [isLoading, isAuthenticated, getAccessTokenSilently, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Processing callback...</div>;
}
