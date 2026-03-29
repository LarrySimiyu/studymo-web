'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {currentUser?.email}
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Metric 1', 'Metric 2', 'Metric 3'].map((title) => (
          <div
            key={title}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
