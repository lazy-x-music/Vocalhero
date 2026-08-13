export interface NoteInfo {
  name: string;
  octave: number;
  frequency: number;
}

const A4 = 440;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function noteToFrequency(noteName: string, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(noteName.toUpperCase());
  if (noteIndex === -1) return 0;
  const semitonesFromA4 = noteIndex - 9 + (octave - 4) * 12;
  return A4 * Math.pow(2, semitonesFromA4 / 12);
}

export function parseNote(note: string): { name: string; octave: number } | null {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return null;
  return { name: match[1], octave: parseInt(match[2], 10) };
}

export function noteStringToFrequency(note: string): number {
  const parsed = parseNote(note);
  if (!parsed) return 0;
  return noteToFrequency(parsed.name, parsed.octave);
}

export function frequencyToNote(freq: number): { name: string; octave: number; cents: number } | null {
  if (freq <= 0) return null;
  const semitonesFromA4 = 12 * Math.log2(freq / A4);
  const roundedSemitones = Math.round(semitonesFromA4);
  const cents = Math.round((semitonesFromA4 - roundedSemitones) * 100);

  let noteIndex = ((roundedSemitones + 9) % 12 + 12) % 12;
  const octave = 4 + Math.floor((roundedSemitones + 9) / 12);

  return {
    name: NOTE_NAMES[noteIndex],
    octave,
    cents,
  };
}

export function frequencyToNoteString(freq: number): string {
  const info = frequencyToNote(freq);
  if (!info) return '—';
  return `${info.name}${info.octave}`;
}

export function centsDifference(targetFreq: number, actualFreq: number): number {
  if (targetFreq <= 0 || actualFreq <= 0) return 0;
  return Math.round(1200 * Math.log2(actualFreq / targetFreq));
}

export const BEGINNER_NOTES = ['G3', 'A3', 'B3', 'A3', 'G3'] as const;

export function getNoteFrequency(note: string): number {
  return noteStringToFrequency(note);
}
