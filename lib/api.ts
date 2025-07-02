import { SelectCustomerResponse } from './types';
import { getAuth0Client } from './auth0Client';

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;
console.log('APP_ENV', APP_ENV);
export const BASE_URL = `https://app-${APP_ENV}.rimba.ai`;
console.log('BASE_URL', BASE_URL);
// export const BASE_URL = 'http://localhost:8080';


export const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

// Populate header values immediately if running in the browser
if (typeof window !== 'undefined') {
  defaultHeaders['Authorization'] = `Bearer ${localStorage.getItem('access_token') || ''}`;
  defaultHeaders['X-Customer-Id'] = localStorage.getItem('customer_id') || '';
  defaultHeaders['X-Id-Token'] = localStorage.getItem('id_token') || '';
}

class ApiClient {
  private static instance: ApiClient;
  public accessToken: string | null = null;
  public idToken: string | null = null;
  public csId: string | null = null;

  // Add private constructor to load initial state
  private constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.idToken = localStorage.getItem('id_token');
      this.csId = localStorage.getItem('customer_id');
      this.updateDefaultHeaders();
    }
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Always attempt to refresh tokens right before sending the request so that we
    // never hit the backend with an expired JWT.
    await this.refreshTokens();

    const url = `${BASE_URL}${endpoint}`;
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    });

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    if (this.idToken) {
      headers.set('X-Id-Token', this.idToken);
    }

    if (this.csId) {
      headers.set('X-Customer-Id', this.csId);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - try once more with fresh tokens
        if (response.status === 401) {
          console.warn('🚨 401 Unauthorized - Token expired/invalid for:', endpoint);
          console.log('🔄 Attempting token refresh and retry...');
          
          try {
            // Force refresh tokens by clearing cache and refreshing
            this.accessToken = null;
            this.idToken = null;
            await this.refreshTokens();
            
            if (!this.accessToken) {
              throw new Error('Token refresh failed - no new token received');
            }
            
            console.log('✅ Token refresh successful, retrying request...');
            
            // Update headers with new tokens
            if (this.accessToken) {
              headers.set('Authorization', `Bearer ${this.accessToken}`);
            }
            if (this.idToken) {
              headers.set('X-Id-Token', this.idToken);
            }
            
            // Retry the request once
            const retryResponse = await fetch(url, { ...config, headers });
            const retryData = await retryResponse.json();
            
            if (retryResponse.ok) {
              console.log('✅ Request retry successful after token refresh');
              return retryData as T;
            } else if (retryResponse.status === 401) {
              console.log('❌ Still 401 after token refresh - session expired');
              throw new Error('Your session has expired. Please log in again.');
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            this.logout();
            throw new Error('Your session has expired. Please log in again.');
          }
        }

        throw new Error(data.message || 'API request failed');
      }

      return data as T;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw new Error('Unknown API error occurred');
    }
  }

  public async selectCustomer(
    customerId: string
  ): Promise<SelectCustomerResponse> {
    try {
      const response = await this.request<SelectCustomerResponse>(
        '/v2/select/customer/',
        {
          method: 'POST',
          body: JSON.stringify({ customer_id: customerId }),
        }
      );

      return response;
    } catch (error) {
      return {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Customer selection failed',
      };
    }
  }

  public async logout(): Promise<void> {
    // Get the session ID from localStorage
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    
    // Call the logout endpoint if session ID is available
    if (sessionId) {
      try {
        console.log("logging out user session", {sessionId});
        // Wait for the API call to complete before continuing
        await this.post('/v2/user/session/logout/', { session_id: sessionId });
      } catch (error) {
        console.error("Error logging out session:", error);
        // Continue with logout even if API call fails
      }
    }
    
    // Clear tokens and local storage
    this.accessToken = null;
    this.idToken = null;
    this.csId = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('selected_customer');
      localStorage.removeItem('user');
      localStorage.removeItem('customer_id');
      localStorage.removeItem("session_id");

      // Only redirect after everything else is done
      window.location.href = '/';
    }
  }

  // Helper methods for common HTTP methods
  public async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async put<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public async patch<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private updateDefaultHeaders(): void {
    defaultHeaders['Authorization'] = `Bearer ${this.accessToken || ''}`;
    defaultHeaders['X-Id-Token'] = this.idToken || '';
    defaultHeaders['X-Customer-Id'] = this.csId || '';
  }

  public setTokens(accessToken: string, idToken: string, customerId: string): void {
    this.accessToken = accessToken;
    this.idToken = idToken;
    this.csId = customerId;
    this.updateDefaultHeaders();
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('id_token', idToken);
      localStorage.setItem('customer_id', customerId);
    }
  }

  public setCustomerId(customerId: string): void {
    this.csId = customerId;
    this.updateDefaultHeaders();
    if (typeof window !== 'undefined') {
      localStorage.setItem('customer_id', customerId);
    }
  }

  /**
   * Try to obtain a fresh access token and id token from Auth0.
   * Falls back to logout on unrecoverable errors (e.g. session expired).
   */
  private async refreshTokens(): Promise<void> {
    if (typeof window === 'undefined') return; // SSR safeguard

    try {
      const auth0 = await getAuth0Client();
      const accessToken = await auth0.getTokenSilently({
        authorizationParams: { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE as string },
      }).catch(() => undefined);
      const idTokenClaims = await auth0.getIdTokenClaims().catch(() => undefined as any);
      const idToken = idTokenClaims?.__raw as string | undefined;

      if (accessToken) {
        const finalIdToken = idToken ?? this.idToken ?? '';
        // Preserve existing customer id if present
        const customerId = this.csId || localStorage.getItem('customer_id') || '';
        this.setTokens(accessToken, finalIdToken, customerId);
      }
    } catch (err) {
      console.error('Unable to silently refresh Auth0 token', err);
      // If silent auth fails we clear local state and force full reload/login.
      this.accessToken = null;
      this.idToken = null;
      this.updateDefaultHeaders();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        // Redirect to landing page which will trigger a fresh Auth0 login flow.
        window.location.href = '/';
      }
    }
  }
}

// Export singleton instance
export const api = ApiClient.getInstance();
