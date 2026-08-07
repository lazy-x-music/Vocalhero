import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { Dumbbell, TrendingUp, Trophy } from 'lucide-react';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function RequireOnboarding({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthed>
              <SignupPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <DashboardPage />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <ProfilePage />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/train"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <PlaceholderPage
                  icon={<Dumbbell size={36} />}
                  title="Train"
                  description="Structured vocal workouts, warm-ups, and guided exercises are on the way."
                />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/progress"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <PlaceholderPage
                  icon={<TrendingUp size={36} />}
                  title="Progress"
                  description="Detailed analytics, range tracking, and before/after comparisons coming soon."
                />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
        <Route
          path="/achievements"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <PlaceholderPage
                  icon={<Trophy size={36} />}
                  title="Achievements"
                  description="Badges, milestones, and your achievement collection are being built."
                />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
