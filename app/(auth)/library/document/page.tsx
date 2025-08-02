import { Suspense } from 'react';
import DocumentClient from './dynamic-wrapper';
import { InsightLoader } from '@/components/ui/loader';

export default function DocumentPage() {
    return (
        <Suspense fallback={<InsightLoader size="default" />}>
            <DocumentClient />
        </Suspense>
    );
}