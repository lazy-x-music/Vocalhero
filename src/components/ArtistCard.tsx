import { Check } from 'lucide-react';
import { ARTIST_INSPIRATIONS } from '@/config/onboarding';

interface ArtistCardProps {
  artistId: string;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function ArtistCard({ artistId, selected, onToggle }: ArtistCardProps) {
  const artist = ARTIST_INSPIRATIONS.find((a) => a.id === artistId);
  if (!artist) return null;

  return (
    <button
      type="button"
      onClick={() => onToggle(artistId)}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
        selected
          ? 'border-accent bg-accent-soft'
          : 'border-border bg-bg-secondary hover:border-border-strong hover:bg-bg-tertiary'
      }`}
    >
      {selected && (
        <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
          <Check size={13} className="text-white" />
        </span>
      )}
      <div
        className={`h-14 w-14 rounded-full flex items-center justify-center font-bold font-display text-lg ${
          selected ? 'bg-accent text-white' : 'bg-bg-elevated text-text-secondary'
        }`}
      >
        {artist.name.charAt(0)}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold leading-tight">{artist.name}</p>
        <p className="text-xs text-text-muted mt-0.5">{artist.tag}</p>
      </div>
    </button>
  );
}
