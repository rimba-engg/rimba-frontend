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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-4 rounded shadow-md border border-green-500">
          <div className="flex items-center">
            <span className="ml-2">Loading...</span>
            <div className="spinner ml-2"></div>
          </div>
        </div>
        <style jsx>{`
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color:rgb(15, 117, 64); /* Primary color */
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-4 rounded shadow-md border border-green-500">
        <div className="flex items-center">
          <span className="ml-2">Processing callback...</span>
          <div className="spinner ml-2"></div>
        </div>
      </div>
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color:rgb(15, 117, 64); /* Primary color */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
