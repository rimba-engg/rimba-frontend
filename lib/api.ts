import { SelectCustomerResponse } from './types';

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;
console.log('APP_ENV', APP_ENV);
export const BASE_URL = `https://app-${APP_ENV}.rimba.ai`;
console.log('BASE_URL', BASE_URL);
// export const BASE_URL = 'http://localhost:8000';


export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
  'X-Customer-Id': localStorage.getItem('customer_id') || '',
  'X-Id-Token': localStorage.getItem('id_token') || ''
};


class ApiClient {
  private static instance: ApiClient;
  private accessToken: string | null = null;
  private idToken: string | null = null;
  private csId: string | null = null;

  
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
        // Handle 401 Unauthorized - logout
        if (response.status === 401) 
          this.logout();

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

  public logout(): void {
    this.accessToken = null;
    this.idToken = null;
    this.csId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('selected_customer');
      localStorage.removeItem('user');
      localStorage.removeItem('customer_id');

      // Redirect to root
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
}

// Export singleton instance
export const api = ApiClient.getInstance();
