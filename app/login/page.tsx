'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, getStoredUser, getStoredCustomer } from '@/lib/auth';
import { type Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      router.push('/library/documents');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const response = await login(email, password);
    
    if (response.user) {
      if (response.customers) {
        router.push('/select-customer');
      } else {
        const customer = getStoredCustomer();
        if (customer?.is_rng_customer ?? false)
          router.push('/reporting/rng-mass-balance');
        else
          router.push('/library/documents');
      }
    } else {
      setError('Invalid credentials');
    }
  };

  const handleForgotPassword = () => {
    window.location.href = 'mailto:akshay@rimba.ai?subject=Password Reset Request&body=Hello, I need help resetting my password for the Rimba platform.';
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
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="on"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Button
                type="button"
                variant="link"
                className="px-0 text-primary"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}