// pages/checklist.tsx
import { Suspense } from 'react';
import ChecklistPageClient from './dynamic-wrapper';

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChecklistPageClient />
    </Suspense>
  );
}
