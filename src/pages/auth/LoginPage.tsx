import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { logIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await logIn(email, password);
    setLoading(false);
    if (res.ok) {
      toast.show('Welcome back!', 'success');
      navigate('/dashboard');
    } else {
      toast.show(res.error || 'Login failed', 'error');
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="text-accent font-semibold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          Log In
        </Button>
      </form>
    </AuthLayout>
  );
}
