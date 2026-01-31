'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const FinancesContent = dynamic(() => import('@/components/utilities/FinancesContent'), {
    ssr: false,
    loading: () => <Loading />,
});

export default function FinancesPage() {
    return (
        <Suspense fallback={<Loading />}>
            <FinancesContent />
        </Suspense>
    );
}
