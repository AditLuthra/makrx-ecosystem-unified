'use client';

import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const Status = dynamicImport(() => import('../../components/page-components/PlaceholderPage').then(mod => ({ default: mod.Status })), {
  ssr: false,
  loading: () => <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
});

export default function StatusPage() {
  return <Status />;
}
