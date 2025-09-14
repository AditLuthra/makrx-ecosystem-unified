'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function PortalPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/portal/dashboard');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-gray-600">Taking you to your dashboard</p>
      </div>
    </div>
  );
}
