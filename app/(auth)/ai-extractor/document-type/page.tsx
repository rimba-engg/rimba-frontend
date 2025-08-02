import { Suspense } from 'react';
import DocumentTypeDetailClient from './dynamic-wrapper';
import { InsightLoader } from '@/components/ui/loader';

export default function DocumentTypeDetail() {
  return (
    <Suspense fallback={<InsightLoader size="default" />}>
      <DocumentTypeDetailClient />
    </Suspense>
  );
}