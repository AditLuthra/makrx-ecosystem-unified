'use client';

import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const Careers = dynamicImport(() => import('../../components/page-components/PlaceholderPage').then(mod => ({ default: mod.Careers })), {
  ssr: false,
  loading: () => <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
});

export default function CareersPage() {
  return <Careers />;
}
