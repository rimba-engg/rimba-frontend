import {Suspense} from 'react';
import TransactionsList from './dynamic-wrapper';

export default function ContractPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TransactionsList />
        </Suspense>
    );
}