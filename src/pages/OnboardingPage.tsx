import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { ArtistCard } from '@/components/ArtistCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { saveOnboardingData } from '@/lib/userService';
import {
  SINGER_TYPES,
  VOCAL_GOALS,
  MUSIC_STYLES,
  ARTIST_INSPIRATIONS,
} from '@/config/onboarding';
import type { SingerType, VocalGoal, MusicStyle, OnboardingData } from '@/types';

const TOTAL_STEPS = 4;

export function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    singerType: null,
    goals: [],
    musicStyles: [],
    inspirations: [],
  });

  const toggleArray = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const canProceed = () => {
    if (step === 1) return data.singerType !== null;
    if (step === 2) return data.goals.length > 0;
    if (step === 3) return data.musicStyles.length > 0;
    if (step === 4) return data.inspirations.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveOnboardingData(user.uid, data);
      await refreshProfile();
      toast.show("Onboarding complete. Let's train!", 'success');
      navigate('/dashboard');
    } catch {
      toast.show('Could not save onboarding. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] bg-accent/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-red-700 flex items-center justify-center font-bold font-display text-white">
              V
            </div>
            <span className="font-bold font-display">Vocal Hero</span>
          </div>
          <OnboardingProgress current={step} total={TOTAL_STEPS} />
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center" key={step}>
          <div className="animate-fade-up">
            {step === 1 && (
              <StepWrapper title="What kind of singer are you?" subtitle="This helps us calibrate your starting point.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SINGER_TYPES.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setData({ ...data, singerType: opt.id as SingerType })}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                        data.singerType === opt.id
                          ? 'border-accent bg-accent-soft'
                          : 'border-border bg-bg-secondary hover:border-border-strong'
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          data.singerType === opt.id ? 'border-accent bg-accent' : 'border-text-muted'
                        }`}
                      >
                        {data.singerType === opt.id && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold">{opt.label}</p>
                        {opt.description && <p className="text-xs text-text-muted mt-0.5">{opt.description}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {step === 2 && (
              <StepWrapper title="What do you want to improve?" subtitle="Select all that matter to you.">
                <div className="flex flex-wrap gap-3">
                  {VOCAL_GOALS.map((opt) => {
                    const selected = data.goals.includes(opt.id as VocalGoal);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setData({ ...data, goals: toggleArray(data.goals, opt.id as VocalGoal) })}
                        className={`px-5 py-3 rounded-xl border font-medium transition-all ${
                          selected
                            ? 'border-accent bg-accent-soft text-accent'
                            : 'border-border bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </StepWrapper>
            )}

            {step === 3 && (
              <StepWrapper title="What music do you love?" subtitle="We'll tune your training to your style.">
                <div className="flex flex-wrap gap-3">
                  {MUSIC_STYLES.map((opt) => {
                    const selected = data.musicStyles.includes(opt.id as MusicStyle);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setData({ ...data, musicStyles: toggleArray(data.musicStyles, opt.id as MusicStyle) })}
                        className={`px-5 py-3 rounded-xl border font-medium transition-all ${
                          selected
                            ? 'border-accent bg-accent-soft text-accent'
                            : 'border-border bg-bg-secondary text-text-secondary hover:border-border-strong hover:text-text'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </StepWrapper>
            )}

            {step === 4 && (
              <StepWrapper
                title="Who inspires your voice?"
                subtitle="These help personalize your training — not clone any voice."
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ARTIST_INSPIRATIONS.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artistId={artist.id}
                      selected={data.inspirations.includes(artist.id)}
                      onToggle={(id) => setData({ ...data, inspirations: toggleArray(data.inspirations, id) })}
                    />
                  ))}
                </div>
              </StepWrapper>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="ghost"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate('/dashboard'))}
            leftIcon={<ArrowLeft size={18} />}
          >
            {step > 1 ? 'Back' : 'Skip'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            loading={saving}
            rightIcon={step < TOTAL_STEPS ? <ArrowRight size={18} /> : undefined}
          >
            {step === TOTAL_STEPS ? 'Finish' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepWrapper({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold font-display mb-2">{title}</h1>
      <p className="text-text-secondary mb-8">{subtitle}</p>
      {children}
    </div>
  );
}
