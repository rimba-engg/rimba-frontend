'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddCustomerModalProps {
  onClose: () => void;
  onCustomerCreated: (customer: any) => void;
}

export default function AddCustomerModal({ onClose, onCustomerCreated }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Prepare payload converting comma-separated fields to arrays and parsing JSON if provided
    const payload = {
      name,
      description,
      address,
      billing_address: billingAddress,
    };

    setError('');
    setLoading(true);
    try {
      const response: any = await api.post('/user-mgt/v2/customer/', payload);
      if (response.success) {
        // Pass the returned customer data to the parent callback
        onCustomerCreated(response.data);
        onClose();
      } else {
        setError(response.message || 'Failed to create customer');
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
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      {/* Modal box */}
      <div className="bg-white p-6 rounded shadow-md z-10 w-full max-w-md overflow-y-auto max-h-full">
        <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
        {error && <p className="mb-2 text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <Label htmlFor="name">Name*</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Name"
              required
            />
          </div>
          {/* Description */}
          <div className="mb-4">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter description (optional)"
            />
          </div>
          {/* Address */}
          <div className="mb-4">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
          {/* Billing Address */}
          <div className="mb-4">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input
              id="billingAddress"
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Enter billing address"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 