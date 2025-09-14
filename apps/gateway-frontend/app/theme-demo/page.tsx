'use client';

import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const ThemeDemo = dynamicImport(() => import('../../components/page-components/PlaceholderPage').then(mod => ({ default: mod.ThemeDemo })), {
  ssr: false,
  loading: () => <div className="min-h-screen py-20 flex items-center justify-center">Loading...</div>
});

export default function ThemeDemoPage() {
  return <ThemeDemo />;
}
