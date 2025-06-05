'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { api } from '@/lib/api';

// Refresh interval in milliseconds (10 minutes)
const REFRESH_INTERVAL = 10 * 60 * 1000;

export default function TokenRefresher() {
  const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const refresh = async () => {
      try {
        const res = await getAccessTokenSilently({ detailedResponse: true });
        if (!isMounted) return;
        const accessToken = res.access_token as string;
        const idToken = res.id_token as string;
        const customerId = localStorage.getItem('customer_id') || '';
        api.setTokens(accessToken, idToken, customerId);
      } catch (err) {
        console.error('Token refresh failed', err);
        if (isMounted) {
          logout({ logoutParams: { returnTo: window.location.origin } });
        }
      }
    };

    // Run immediately and then on the interval.
    refresh();
    const timer = setInterval(refresh, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated, getAccessTokenSilently, logout]);

  return null;
} 