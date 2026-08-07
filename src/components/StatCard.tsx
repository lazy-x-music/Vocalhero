import { type ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-bg-secondary border border-border p-5 hover:border-border-strong transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-text-muted font-semibold">{label}</span>
        <span className={accent ? 'text-accent' : 'text-text-muted'}>{icon}</span>
      </div>
      <p className="text-2xl font-bold font-display">{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
    </div>
  );
}
