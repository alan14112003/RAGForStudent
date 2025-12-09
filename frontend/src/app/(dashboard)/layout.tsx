'use client';

import RequireAuth from '@/components/auth/require-auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
