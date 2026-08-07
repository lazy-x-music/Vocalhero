import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.show('Password should be at least 6 characters.', 'error');
      return;
    }
    setLoading(true);
    const res = await signUp(email, password, displayName || email.split('@')[0]);
    setLoading(false);
    if (res.ok) {
      toast.show('Account created. Welcome to Vocal Hero!', 'success');
      navigate('/onboarding');
    } else {
      toast.show(res.error || 'Signup failed', 'error');
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start your journey to a better voice."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-secondary border border-border text-text placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-secondary border border-border text-text placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-bg-secondary border border-border text-text placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
            />
          </div>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
}
