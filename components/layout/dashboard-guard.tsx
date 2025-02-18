'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';

export default function DashboardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}