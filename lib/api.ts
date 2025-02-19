import { User, Customer, LoginResponse, SelectCustomerResponse, ApiError } from './types';

const BASE_URL = 'https://app.rimba.ai';
// const BASE_URL = 'http://localhost:8000';

class ApiClient {
  private static instance: ApiClient;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    // Load tokens from localStorage if they exist
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
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

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with new token
            return this.request<T>(endpoint, options);
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

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      this.logout();
      return false;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/v2/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      this.setTokens(data.tokens.access, data.tokens.refresh);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.request<LoginResponse>('/v2/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 'success' && response.data?.tokens) {
        this.setTokens(
          response.data.tokens.access,
          response.data.tokens.refresh
        );
      }

      return response;
    } catch (error) {
      console.log('Error', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  public async selectCustomer(customerId: string): Promise<SelectCustomerResponse> {
    try {
      const response = await this.request<SelectCustomerResponse>('/v2/select/customer/', {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId }),
      });

      if (response.status === 'success' && response.data?.tokens) {
        this.setTokens(
          response.data.tokens.access,
          response.data.tokens.refresh
        );
      }

      return response;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Customer selection failed',
      };
    }
  }

  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('selected_customer');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
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

  public async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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