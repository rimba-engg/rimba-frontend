'use client';

import { useState, useEffect } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    setRedirectUri(window.location.origin + '/callback');
  }, []);

  if (!redirectUri) return null; // or a loading indicator

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{ redirect_uri: redirectUri, audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE! }}
    >
      {children}
    </Auth0Provider>
  );
}

export default ClientAuthProvider;