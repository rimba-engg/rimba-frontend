'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectCustomer } from '@/lib/auth';
import { type Customer } from '@/lib/types';
import { getStoredUser, getStoredCustomer } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CustomerSelectProps {
  customers: Customer[];
}

export function CustomerSelect({ customers }: CustomerSelectProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCustomerSelect = async () => {
    if (!selectedCustomerId) {
      setError('Please select a customer account');
      return;
    }

    setLoading(true);
    try {
      const response = await selectCustomer(selectedCustomerId);
      if (response.status === 'success') {
        const customer = getStoredCustomer();
        if (customer?.is_rng_customer)
          router.push('/reporting/rng-mass-balance');
        else
          router.push('/library/documents');
      } else {
        setError('Failed to select customer account');
      }
    } catch (error) {
      setError('Failed to select customer account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img
              src="https://cmlvdwcarxngwmualiyn.supabase.co/storage/v1/object/public/vertex-assets//logo-with-text-white.jpg"
              alt="Rimba"
              className="h-12"
            />
          </div>
          <CardTitle className="text-2xl">Select Customer Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a customer account" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={customer.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-row gap-2">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-sm text-muted-foreground">
                        Role: {customer.role}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={handleCustomerSelect}
            className="w-full"
            disabled={!selectedCustomerId || loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Continue"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}