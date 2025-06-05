'use client';

import type { Auth0Client } from '@auth0/auth0-spa-js';
import { createAuth0Client } from '@auth0/auth0-spa-js';

let auth0ClientPromise: Promise<Auth0Client> | undefined;

export function getAuth0Client(): Promise<Auth0Client> {
  if (!auth0ClientPromise) {
    auth0ClientPromise = createAuth0Client({
      domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN as string,
      clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string,
      authorizationParams: {
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE as string,
      },
      cacheLocation: 'memory',
      useRefreshTokens: true,
    });
  }

  // Non-null assertion because we always set it right above when undefined.
  return auth0ClientPromise!;
} 