import { api, BASE_URL,defaultHeaders } from './api';
import { User, Customer, SelectCustomerResponse, UserInfoResponse } from './types';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function getStoredCustomer(): Customer | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('selected_customer');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export async function getUserInfo(): Promise<{ user: User | null; customers: Customer[] | null }> {
  const response = await api.post<UserInfoResponse>('/v2/user/info/', {});
  if (response) {
    const { user, customers } = response;
    return { user, customers };
  }
  return { user: null, customers: null };
}

export async function createUserSession(): Promise<{ sessionId: string | null; success: boolean; message?: string }> {
  try {
    // Generate a unique session ID (could use UUID or other methods)
    const sessionId = crypto.randomUUID();
    console.log('sessionId', sessionId);
    
    // Send to backend
    const response = await api.post<{
      status: string;
      message: string;
      data?: {
        session_id: string;
        login_time: string;
      }
    }>('/v2/user/session/', { session_id: sessionId });
    
    if (response && response.status === 'success' && response.data) {
      console.log('response.data', response.data);
      // Store the session ID from the response in localStorage
      localStorage.setItem('session_id', response.data.session_id);
      return { sessionId: response.data.session_id, success: true };
    }
    
    return { 
      sessionId: null, 
      success: false, 
      message: response?.message || 'Failed to create session' 
    };
  } catch (error) {
    console.error('Session creation error:', error);
    return {
      sessionId: null,
      success: false,
      message: error instanceof Error ? error.message : 'Session creation failed',
    };
  }
}

export async function selectCustomer(customerId: string): Promise<SelectCustomerResponse> {
  try {
    const response = await api.selectCustomer(customerId);
    
    if (response.status === 'success' && response.data) {
      const { customer } = response.data;
      localStorage.setItem('selected_customer', JSON.stringify(customer));
      api.setCustomerId(customer.id);
    }
    
    return response;
  } catch (error) {
    console.error('Customer selection error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Customer selection failed',
    };
  }
}

export function logout() {
  api.logout();
  localStorage.removeItem('user');
  localStorage.removeItem('selected_customer');
  localStorage.removeItem('all_customers');
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('customer_id');
  localStorage.removeItem('session_id');
  window.location.replace(window.location.origin);
}