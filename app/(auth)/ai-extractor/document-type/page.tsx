import { Suspense } from 'react';
import DocumentTypeDetailClient from './dynamic-wrapper';

export default function DocumentTypeDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentTypeDetailClient />
    </Suspense>
  );
}