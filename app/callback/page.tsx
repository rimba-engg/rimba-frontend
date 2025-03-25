'use client';
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { getUserInfo, selectCustomer } from '@/lib/auth';
import { api } from '@/lib/api';
export default function CallbackPage() {
  const { 
      // Auth state:
      error,
      isAuthenticated,
      isLoading,
      user,
      // Auth methods:
      getAccessTokenSilently,
      logout,
  } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      (async () => {
        try {
          const response = await getAccessTokenSilently({detailedResponse: true});
          const accessToken = response.access_token;
          const idToken = response.id_token;

          // store the token in local storage
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('id_token', idToken);
          console.log('access_token', accessToken);
          api.setTokens(accessToken, idToken, '');
          // for debugging
          console.log('access_token', accessToken);
          console.log('id_token', idToken);
          console.log('user', user);

          // fetch user info from backend
          let userInfoResponse;
          try {
            userInfoResponse = await getUserInfo();
            console.log('userInfoResponse', userInfoResponse);
            console.log('getUserInfo call succeeded');
          } catch (error) {
            console.error('getUserInfo call failed:', error);
            // Trigger logout on any error
            api.logout();
            logout({ logoutParams: { returnTo: window.location.origin } });
            console.log('logging out from callback page');
          }

          // save user info in local storage
          if (userInfoResponse) {
            localStorage.setItem('user', JSON.stringify(userInfoResponse.user));
            localStorage.setItem('all_customers', JSON.stringify(userInfoResponse.customers));
          }

          // for debugging
          console.log('user from backend', userInfoResponse?.user);
          console.log('all_customers from backend', userInfoResponse?.customers);

          // if there is only one customer, select it
          if (userInfoResponse?.customers && userInfoResponse.customers.length === 1) {
            await selectCustomer(userInfoResponse.customers[0].id);
          }
          console.log('redirecting to home');
          router.push('/'); // redirect after processing
        } catch (err) {
          console.error('Error getting token:', err);
        }
      })();
    }
  }, [user, isLoading, isAuthenticated, getAccessTokenSilently, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Processing callback...</div>;
}
