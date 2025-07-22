'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { api } from '@/lib/api';

// Refresh interval in milliseconds (3 minutes)
const REFRESH_INTERVAL = 3 * 60 * 1000;

export default function TokenRefresher() {
  const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const refresh = async () => {
      try {
        console.log('🔄 TokenRefresher: Starting scheduled token refresh...');
        
        const res = await getAccessTokenSilently({ 
          detailedResponse: true,
          cacheMode: process.env.NODE_ENV === 'production' ? 'on' : 'off'
        });
        if (!isMounted) return;
        
        const accessToken = res.access_token as string;
        const idToken = res.id_token as string;
        const customerId = localStorage.getItem('customer_id') || '';
        
        if (accessToken && idToken) {
          console.log('✅ TokenRefresher: Successfully obtained new tokens');
          
          // Check expiration of new token
          try {
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            const expiresAt = new Date(payload.exp * 1000);
            const timeUntilExpiry = Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60));
            console.log('⏰ TokenRefresher: New token expires at:', expiresAt.toLocaleString());
            console.log('⏰ TokenRefresher: Time until expiry:', timeUntilExpiry, 'minutes');
          } catch (e) {
            console.log('⚠️  TokenRefresher: Could not parse token expiration');
          }
          
          api.setTokens(accessToken, idToken, customerId);
          console.log('✅ TokenRefresher: Tokens updated successfully');
        } else {
          console.log('❌ TokenRefresher: Received invalid tokens from Auth0');
        }
      } catch (err) {
        console.error('❌ TokenRefresher: Token refresh failed', err);
        console.log('🔄 TokenRefresher: Attempting logout due to refresh failure...');
        if (isMounted) {
          logout({ logoutParams: { returnTo: window.location.origin } });
        }
      }
    };

    // Run immediately and then on the interval.
    console.log('🔄 TokenRefresher: Component mounted, starting token management...');
    console.log('⏰ TokenRefresher: Refresh interval set to', REFRESH_INTERVAL / (1000 * 60), 'minutes');
    
    refresh();
    const timer = setInterval(() => {
      console.log('⏰ TokenRefresher: Scheduled refresh triggered');
      refresh();
    }, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated, getAccessTokenSilently, logout]);

  return null;
} 