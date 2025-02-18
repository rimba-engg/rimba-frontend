import { api } from './api';
import { User, Customer, LoginResponse, SelectCustomerResponse } from './types';

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

export async function login(email: string, password: string): Promise<{ user: User | null; customers: Customer[] | null }> {
  try {
    const response = await api.login(email, password);
    
    if (response.status === 'success' && response.data) {
      const { user, customers } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      
      // If there's only one customer, automatically select it
      if (customers.length === 1) {
        const selectResponse = await selectCustomer(customers[0].id);
        if (selectResponse.status === 'success') {
          return { user, customers: null }; // No need to show customer selection
        }
      }
      
      // Store customers in localStorage for the selection page
      localStorage.setItem('login_customers', JSON.stringify(customers));
      return { user, customers };
    }
    
    return { user: null, customers: null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, customers: null };
  }
}

export async function selectCustomer(customerId: string): Promise<SelectCustomerResponse> {
  try {
    const response = await api.selectCustomer(customerId);
    
    if (response.status === 'success' && response.data) {
      const { customer } = response.data;
      localStorage.setItem('selected_customer', JSON.stringify(customer));
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
  localStorage.removeItem('login_customers');
}