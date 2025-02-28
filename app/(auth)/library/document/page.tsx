import { Suspense } from 'react';
import DocumentClient from './dynamic-wrapper';

export default function DocumentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DocumentClient />
        </Suspense>
    );
}