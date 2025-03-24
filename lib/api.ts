import { SelectCustomerResponse } from './types';

export const BASE_URL = 'https://app-v1.rimba.ai';
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

  private constructor() {
    // Load tokens from localStorage if they exist
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.idToken = localStorage.getItem('id_token');      this.csId = localStorage.getItem('customer_id');
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('selected_customer');
      localStorage.removeItem('user');

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
}

// Export singleton instance
export const api = ApiClient.getInstance();
