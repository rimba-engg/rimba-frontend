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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const payload = {
      customer_id: customer.id,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    };

    setError('');
    setLoading(true);
    try {
      const response: any = await api.post('/user-mgt/v2/admin-user/', payload);
      if (response.success) {
        alert('Admin user created successfully');
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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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