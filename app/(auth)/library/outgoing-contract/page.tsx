import {Suspense} from 'react';
import ContractClient from './dynamic-wrapper';

export default function ContractPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ContractClient />
        </Suspense>
    );
}