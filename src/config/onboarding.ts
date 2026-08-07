import type { MusicStyle, SingerType, VocalGoal } from '@/types';

export interface OnboardingOption<T extends string> {
  id: T;
  label: string;
  description?: string;
}

export const SINGER_TYPES: OnboardingOption<SingerType>[] = [
  { id: 'just_starting', label: 'Just starting', description: 'New to singing' },
  { id: 'for_fun', label: 'I sing for fun', description: 'Casual & hobby' },
  { id: 'years', label: "I've been singing for years", description: 'Experienced' },
  { id: 'perform_regularly', label: 'I perform regularly', description: 'On stage often' },
];

export const VOCAL_GOALS: OnboardingOption<VocalGoal>[] = [
  { id: 'pitch', label: 'Pitch' },
  { id: 'power', label: 'Power' },
  { id: 'range', label: 'Range' },
  { id: 'control', label: 'Control' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'tone', label: 'Tone' },
  { id: 'confidence', label: 'Confidence' },
];

export const MUSIC_STYLES: OnboardingOption<MusicStyle>[] = [
  { id: 'rock', label: 'Rock' },
  { id: 'metal', label: 'Metal' },
  { id: 'alternative', label: 'Alternative' },
  { id: 'pop', label: 'Pop' },
  { id: 'punk', label: 'Punk / Pop Punk' },
  { id: 'indie', label: 'Indie' },
  { id: 'soul', label: 'Soul / R&B' },
  { id: 'country', label: 'Country' },
  { id: 'musical_theatre', label: 'Musical Theatre' },
];

export interface ArtistInspiration {
  id: string;
  name: string;
  tag: string;
}

export const ARTIST_INSPIRATIONS: ArtistInspiration[] = [
  { id: 'chester-bennington', name: 'Chester Bennington', tag: 'Linkin Park' },
  { id: 'chris-cornell', name: 'Chris Cornell', tag: 'Soundgarden' },
  { id: 'steven-tyler', name: 'Steven Tyler', tag: 'Aerosmith' },
  { id: 'gerard-way', name: 'Gerard Way', tag: 'My Chemical Romance' },
  { id: 'oliver-sykes', name: 'Oliver Sykes', tag: 'Bring Me the Horizon' },
  { id: 'myles-kennedy', name: 'Myles Kennedy', tag: 'Alter Bridge' },
  { id: 'corey-taylor', name: 'Corey Taylor', tag: 'Slipknot' },
  { id: 'dave-grohl', name: 'Dave Grohl', tag: 'Foo Fighters' },
  { id: 'hayley-williams', name: 'Hayley Williams', tag: 'Paramore' },
  { id: 'bruno-mars', name: 'Bruno Mars', tag: 'Solo' },
  { id: 'adele', name: 'Adele', tag: 'Solo' },
];
