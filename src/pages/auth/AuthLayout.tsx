import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] bg-accent/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="flex items-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-red-700 flex items-center justify-center font-bold font-display text-white text-lg shadow-lg shadow-accent/20">
            V
          </div>
          <span className="font-bold font-display text-lg">Vocal Hero</span>
        </Link>

        <div className="w-full max-w-sm animate-fade-up">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-6">
            <ArrowLeft size={14} /> Back
          </Link>
          <h1 className="text-3xl font-bold font-display mb-2">{title}</h1>
          <p className="text-text-secondary mb-8">{subtitle}</p>
          {children}
          <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>
        </div>
      </div>
    </div>
  );
}
