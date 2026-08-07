import { Link } from 'react-router-dom';
import { ArrowRight, Flame, TrendingUp, Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] bg-red-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen max-w-5xl mx-auto px-6">
        {/* Top bar */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-red-700 flex items-center justify-center font-bold font-display text-white text-lg shadow-lg shadow-accent/20">
              V
            </div>
            <span className="font-bold font-display text-base">Vocal Hero</span>
          </div>
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-secondary/60 backdrop-blur-sm mb-8 animate-fade-in">
            <Flame size={14} className="text-accent" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Train. Level Up. Become.
            </span>
          </div>

          <h1 className="font-display font-extrabold text-6xl sm:text-7xl md:text-8xl tracking-tight leading-[0.95] animate-fade-up">
            VOCAL
            <br />
            <span className="bg-gradient-to-r from-accent via-red-500 to-amber-500 bg-clip-text text-transparent">
              HERO
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-md animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Feel yourself becoming a better singer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup" className="flex-1">
              <Button size="xl" fullWidth rightIcon={<ArrowRight size={20} />}>
                Start Your Journey
              </Button>
            </Link>
            <Link to="/login" className="flex-1">
              <Button variant="secondary" size="xl" fullWidth>
                I Have an Account
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: Mic, title: 'Train Daily', desc: 'Guided vocal workouts tuned to your voice' },
              { icon: TrendingUp, title: 'Track Progress', desc: 'Watch your XP, level, and streak grow' },
              { icon: Flame, title: 'Build the Habit', desc: 'Streaks keep you coming back for more' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-bg-secondary/50 backdrop-blur-sm p-5 text-left">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-text-muted">
          Vocal Hero v0.1 — Foundation Build
        </footer>
      </div>
    </div>
  );
}
