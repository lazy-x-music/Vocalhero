interface OnboardingProgressProps {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current - 1
              ? 'w-8 bg-accent'
              : i < current
              ? 'w-1.5 bg-accent/50'
              : 'w-1.5 bg-bg-tertiary'
          }`}
        />
      ))}
    </div>
  );
}
