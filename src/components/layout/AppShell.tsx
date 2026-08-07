import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
          {children}
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
