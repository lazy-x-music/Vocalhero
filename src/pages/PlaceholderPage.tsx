import { type ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';

interface PlaceholderPageProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function PlaceholderPage({ icon, title, description }: PlaceholderPageProps) {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center py-20 animate-fade-up">
        <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
          {icon}
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">{title}</h1>
        <p className="text-text-secondary max-w-sm">{description}</p>
        <span className="mt-6 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-bg-secondary border border-border text-text-muted">
          Coming Soon
        </span>
      </div>
    </AppShell>
  );
}
