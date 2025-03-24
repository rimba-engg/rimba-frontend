'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddAdminUserModalProps {
  customer: {
    id: string;
    name: string;
  };
  onClose: () => void;
}

export default function AddAdminUserModal({ customer, onClose }: AddAdminUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        customer_id: customer.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role_name: 'ADMIN',
      };

      // API POST request similar to the one in @page.tsx
      const response: any = await api.post('/user-mgt/v2/user/', payload);

      if (response.success) {
        // If user creation is successful, close the modal.
        onClose();
      } else {
        setError(response.message || 'Failed to create admin user');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Modal Box */}
      <div className="bg-white p-6 rounded shadow-md z-10 w-full max-w-md overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold mb-4">Add Admin User for {customer.name}</h2>
        {error && <p className="mb-2 text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className="mb-4">
            <Label htmlFor="firstName">First Name*</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="First Name"
              required
            />
          </div>
          {/* Last Name */}
          <div className="mb-4">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Last Name"
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
          {/* Password */}
          <div className="mb-4">
            <Label htmlFor="password">Password*</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 