import {Suspense} from 'react';
import ContractDetails from './dynamic-wrapper';

export default function ContractPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ContractDetails />
        </Suspense>
    );
}