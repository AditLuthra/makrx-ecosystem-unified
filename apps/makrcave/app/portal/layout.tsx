'use client';

import NextLayout from '../../components/NextLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NextLayout>{children}</NextLayout>
    </ProtectedRoute>
  );
}
