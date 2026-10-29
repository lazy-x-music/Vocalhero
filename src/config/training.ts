export interface TrainingStage {
  name: string;
  description: string;
  durationSec: number;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  xpReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Warm-up' | 'Technique' | 'Workout' | 'Cool-down';
  icon: string;
  stages: TrainingStage[];
  custom?: boolean;
}

// ─── Exercise Library ───────────────────────────────────────────
// Reusable exercise blocks the user can pick from when building
// a custom program. Each has a default duration that can be
// adjusted in the builder.

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  description: string;
  defaultSec: number;
  category: 'Warm-up' | 'Technique' | 'Workout' | 'Cool-down';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  // Warm-up exercises
  { id: 'breathing', name: 'Relaxed Breathing', description: 'Deep belly breaths. Inhale 4s, exhale 6s.', defaultSec: 60, category: 'Warm-up', difficulty: 'Beginner' },
  { id: 'lip-trills', name: 'Lip Trills', description: 'Gentle brrrr on a comfortable pitch. Keep airflow steady.', defaultSec: 90, category: 'Warm-up', difficulty: 'Beginner' },
  { id: 'humming-slide', name: 'Humming Slide', description: 'Hum and slowly slide up and down your comfortable range.', defaultSec: 90, category: 'Warm-up', difficulty: 'Beginner' },
  { id: 'tongue-trill', name: 'Tongue Release', description: 'Quick tongue trills (rrr) on a single pitch. Loose and relaxed.', defaultSec: 60, category: 'Warm-up', difficulty: 'Beginner' },
  { id: 'straw-phonation', name: 'Straw Phonation', description: 'Hum through a straw on a single pitch. Relaxed, steady airflow.', defaultSec: 120, category: 'Warm-up', difficulty: 'Beginner' },

  // Technique exercises
  { id: 'reference-match', name: 'Reference Match', description: 'Listen to a tone, then sing it back. Match pitch as closely as you can.', defaultSec: 120, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'interval-steps', name: 'Interval Steps', description: 'Sing up and down a 5-note scale slowly. Focus on each note landing.', defaultSec: 120, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'octave-jump', name: 'Octave Jump', description: 'Sing a comfortable note, then jump exactly one octave up. Then back down.', defaultSec: 120, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'note-hold', name: 'Note Hold', description: 'Sing and hold a single note for 20 seconds. Keep it steady and in tune.', defaultSec: 120, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'scale-climb', name: 'Scale Climb', description: 'Sing a major scale up and down. Pay attention to half-step intervals.', defaultSec: 120, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'hiss-sustain', name: 'Hiss Sustain', description: 'Exhale on a hiss (sssss) for as long as possible. Count the seconds.', defaultSec: 120, category: 'Technique', difficulty: 'Beginner' },
  { id: 'phrase-extension', name: 'Phrase Extension', description: 'Sing a simple phrase and try to make it last longer each time.', defaultSec: 120, category: 'Technique', difficulty: 'Beginner' },

  // Advanced technique
  { id: 'vibrato-drill', name: 'Vibrato Drill', description: 'Sustain a note, then slowly oscillate pitch up and down. Start slow, gradually speed up. Aim for 5-6 cycles per second.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'vibrato-control', name: 'Vibrato Control', description: 'Sing a sustained note with vibrato, then straighten it (no vibrato), then add vibrato back. Practice switching on command.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'mix-voice-blend', name: 'Mix Voice Blend', description: 'Sing through your passaggio (the break between chest and head voice) smoothly. Start in chest, blend into head voice without a break.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'twang-exercise', name: 'Twang Exercise', description: 'Produce a bright, nasal tone (like a duck quack or baby cry). Then apply that brightness to a sustained vowel. Builds power safely.', defaultSec: 90, category: 'Technique', difficulty: 'Advanced' },
  { id: 'whistle-register', name: 'Whistle Register Entry', description: 'Starting from a high head voice, gently let the sound thin into a whistle tone. Very light air pressure. Do not force.', defaultSec: 60, category: 'Technique', difficulty: 'Advanced' },
  { id: 'subharmonic-bass', name: 'Subharmonic Bass', description: 'Sing a low note and gently add a lower octave below it using throat tension. Creates a growling undertone. Keep it relaxed.', defaultSec: 60, category: 'Technique', difficulty: 'Advanced' },
  { id: 'distortion-safe', name: 'Safe Distortion', description: 'Add a controlled rasp to a sustained note using false cord engagement. Never push from the throat — drive from the diaphragm.', defaultSec: 60, category: 'Technique', difficulty: 'Advanced' },
  { id: 'siren-expanded', name: 'Expanded Siren', description: 'Glide from your lowest note to your highest and back. Cover your entire range in one smooth motion. No breaks.', defaultSec: 120, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'ear-training-intervals', name: 'Ear Training: Intervals', description: 'Two notes will play. Identify the interval (major 3rd, perfect 5th, etc.) and sing both notes back.', defaultSec: 120, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'staccato-precision', name: 'Staccato Precision', description: 'Sing short, crisp notes on a scale. Each note should be detached and precise. No sliding between notes.', defaultSec: 90, category: 'Technique', difficulty: 'Intermediate' },
  { id: 'legato-phrasing', name: 'Legato Phrasing', description: 'Sing a melodic phrase with smooth, connected notes. No gaps between notes. Maintain tone quality throughout.', defaultSec: 90, category: 'Technique', difficulty: 'Intermediate' },

  // Workout / power
  { id: 'diaphragm-pulses', name: 'Diaphragm Pulses', description: 'Short bursts of AH-AH-AH on a single pitch. Drive from the diaphragm.', defaultSec: 120, category: 'Workout', difficulty: 'Advanced' },
  { id: 'sustained-power', name: 'Sustained Power', description: 'Hold a medium-loud AH for 30 seconds. Steady breath support.', defaultSec: 120, category: 'Workout', difficulty: 'Advanced' },
  { id: 'dynamic-shifts', name: 'Dynamic Shifts', description: 'Start soft, grow to loud, back to soft on one note. Control the volume.', defaultSec: 120, category: 'Workout', difficulty: 'Advanced' },
  { id: 'chest-voice-climb', name: 'Chest Voice Climb', description: 'Sing up a scale staying in chest voice. Don\'t push too high.', defaultSec: 120, category: 'Workout', difficulty: 'Advanced' },
  { id: 'stamina-run', name: 'Stamina Run', description: 'Sing a 5-note pattern continuously for 2 minutes. No breaks.', defaultSec: 120, category: 'Workout', difficulty: 'Advanced' },
  { id: 'belting-safe', name: 'Safe Belting', description: 'Sing high notes in chest-mix with bright twang. Keep the larynx neutral. Never strain — if it hurts, stop.', defaultSec: 90, category: 'Workout', difficulty: 'Advanced' },
  { id: 'mix-belt-bridge', name: 'Mix-Belt Bridge', description: 'Sing through the passaggio with increasing intensity. Blend chest resonance into head voice with power.', defaultSec: 90, category: 'Workout', difficulty: 'Advanced' },
  { id: 'messiah-di-sten', name: 'Messa di Voce', description: 'On a single sustained note: start pianissimo, swell to fortissimo, then fade back to pianissimo. The ultimate breath control exercise.', defaultSec: 120, category: 'Workout', difficulty: 'Advanced' },

  // Agility
  { id: 'quick-scales', name: 'Quick Scales', description: 'Sing a major scale as fast as you can, up and down. Keep it clean.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'triplet-runs', name: 'Triplet Runs', description: 'Sing three-note patterns (do-mi-sol) quickly, repeating up the scale.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'grace-notes', name: 'Grace Notes', description: 'Add quick grace notes before each main note of a simple melody.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'two-octave-run', name: 'Two-Octave Run', description: 'Run up two octaves as fast as possible, then back down.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'pentatonic-improv', name: 'Pentatonic Improvisation', description: 'Make up your own run over a pentatonic backing. Be creative, stay in key.', defaultSec: 120, category: 'Technique', difficulty: 'Advanced' },
  { id: 'chromatic-run', name: 'Chromatic Climb', description: 'Sing every semitone up and down an octave. Focus on precision, not speed.', defaultSec: 90, category: 'Technique', difficulty: 'Advanced' },
  { id: 'arpeggio-sweep', name: 'Arpeggio Sweep', description: 'Sing major and minor arpeggios (do-mi-sol-do) quickly across your range.', defaultSec: 90, category: 'Technique', difficulty: 'Advanced' },

  // Cool-down
  { id: 'soft-humming', name: 'Soft Humming', description: 'Very gentle hum on a low comfortable pitch. Let it fade.', defaultSec: 90, category: 'Cool-down', difficulty: 'Beginner' },
  { id: 'lip-trill-down', name: 'Lip Trill Down', description: 'Lip trills sliding gently downward. Getting softer and softer.', defaultSec: 90, category: 'Cool-down', difficulty: 'Beginner' },
  { id: 'sigh-release', name: 'Sigh Release', description: 'Inhale, then sigh out on AH from high to low. Release all tension.', defaultSec: 60, category: 'Cool-down', difficulty: 'Beginner' },
  { id: 'silent-breath', name: 'Silent Breath', description: 'Quiet breathing for 60 seconds. Feel the voice rest.', defaultSec: 60, category: 'Cool-down', difficulty: 'Beginner' },
  { id: 'recovery-hum', name: 'Recovery Hum', description: 'Gentle humming to recover. Let the voice settle.', defaultSec: 120, category: 'Cool-down', difficulty: 'Beginner' },
  { id: 'recovery-breath', name: 'Recovery Breath', description: 'Quick inhale exercises. 4 short sniff-in breaths, then long exhale.', defaultSec: 90, category: 'Cool-down', difficulty: 'Beginner' },
];

// ─── Built-in Programs ───────────────────────────────────────────

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'morning-warmup',
    title: 'Morning Warm-Up',
    description: 'Gentle exercises to wake up your voice. Start here every day.',
    durationMin: 8,
    xpReward: 40,
    difficulty: 'Beginner',
    category: 'Warm-up',
    icon: 'sunrise',
    stages: [
      { name: 'Relaxed Breathing', description: 'Deep belly breaths. Inhale 4s, exhale 6s.', durationSec: 60 },
      { name: 'Lip Trills', description: 'Gentle brrrr on a comfortable pitch. Keep airflow steady.', durationSec: 90 },
      { name: 'Humming Slide', description: 'Hum and slowly slide up and down your comfortable range.', durationSec: 90 },
      { name: 'Tongue Release', description: 'Quick tongue trills (rrr) on a single pitch. Loose and relaxed.', durationSec: 60 },
      { name: 'Vowel Ah', description: 'Sustain a relaxed AH on your most comfortable note.', durationSec: 90 },
      { name: 'Cool Down', description: 'Gentle hum downward, getting softer. Release tension.', durationSec: 90 },
    ],
  },
  {
    id: 'pitch-accuracy',
    title: 'Pitch Accuracy Lab',
    description: 'Train your ear and voice to hit notes precisely.',
    durationMin: 12,
    xpReward: 60,
    difficulty: 'Intermediate',
    category: 'Technique',
    icon: 'target',
    stages: [
      { name: 'Reference Match', description: 'Listen to a tone, then sing it back. Match pitch as closely as you can.', durationSec: 120 },
      { name: 'Interval Steps', description: 'Sing up and down a 5-note scale slowly. Focus on each note landing.', durationSec: 120 },
      { name: 'Octave Jump', description: 'Sing a comfortable note, then jump exactly one octave up. Then back down.', durationSec: 120 },
      { name: 'Note Hold', description: 'Sing and hold a single note for 20 seconds. Keep it steady and in tune.', durationSec: 120 },
      { name: 'Scale Climb', description: 'Sing a major scale up and down. Pay attention to half-step intervals.', durationSec: 120 },
      { name: 'Random Notes', description: 'A sequence of random notes will play. Sing each one back immediately.', durationSec: 120 },
    ],
  },
  {
    id: 'power-endurance',
    title: 'Power & Endurance',
    description: 'Build vocal stamina and controlled projection.',
    durationMin: 15,
    xpReward: 80,
    difficulty: 'Advanced',
    category: 'Workout',
    icon: 'flame',
    stages: [
      { name: 'Diaphragm Pulses', description: 'Short bursts of AH-AH-AH on a single pitch. Drive from the diaphragm.', durationSec: 120 },
      { name: 'Sustained Power', description: 'Hold a medium-loud AH for 30 seconds. Steady breath support.', durationSec: 120 },
      { name: 'Dynamic Shifts', description: 'Start soft, grow to loud, back to soft on one note. Control the volume.', durationSec: 120 },
      { name: 'Chest Voice Climb', description: 'Sing up a scale staying in chest voice. Don\'t push too high.', durationSec: 120 },
      { name: 'Stamina Run', description: 'Sing a 5-note pattern continuously for 2 minutes. No breaks.', durationSec: 120 },
      { name: 'Recovery Hum', description: 'Gentle humming to recover. Let the voice settle.', durationSec: 120 },
    ],
  },
  {
    id: 'agility-runs',
    title: 'Agility Runs',
    description: 'Fast vocal runs and melismas for flexibility.',
    durationMin: 10,
    xpReward: 70,
    difficulty: 'Advanced',
    category: 'Technique',
    icon: 'zap',
    stages: [
      { name: 'Quick Scales', description: 'Sing a major scale as fast as you can, up and down. Keep it clean.', durationSec: 120 },
      { name: 'Triplet Runs', description: 'Sing three-note patterns (do-mi-sol) quickly, repeating up the scale.', durationSec: 120 },
      { name: 'Grace Notes', description: 'Add quick grace notes before each main note of a simple melody.', durationSec: 120 },
      { name: 'Two-Octave Run', description: 'Run up two octaves as fast as possible, then back down.', durationSec: 120 },
      { name: 'Improvisation', description: 'Make up your own run over a simple backing pattern. Be creative.', durationSec: 120 },
    ],
  },
  {
    id: 'breath-control',
    title: 'Breath Control',
    description: 'Master your breath support for longer phrases and stability.',
    durationMin: 10,
    xpReward: 50,
    difficulty: 'Beginner',
    category: 'Technique',
    icon: 'wind',
    stages: [
      { name: 'Diaphragm Check', description: 'Lie down or stand tall. Feel your belly expand on inhale, contract on exhale.', durationSec: 90 },
      { name: 'Hiss Sustain', description: 'Exhale on a hiss (sssss) for as long as possible. Count the seconds.', durationSec: 120 },
      { name: 'Straw Phonation', description: 'Hum through a straw on a single pitch. Relaxed, steady airflow.', durationSec: 120 },
      { name: 'Phrase Extension', description: 'Sing a simple phrase and try to make it last longer each time.', durationSec: 120 },
      { name: 'Recovery Breath', description: 'Quick inhale exercises. 4 short sniff-in breaths, then long exhale.', durationSec: 90 },
    ],
  },
  {
    id: 'cool-down',
    title: 'Cool Down & Relax',
    description: 'Soothe your voice after intense practice. Always end here.',
    durationMin: 5,
    xpReward: 25,
    difficulty: 'Beginner',
    category: 'Cool-down',
    icon: 'moon',
    stages: [
      { name: 'Soft Humming', description: 'Very gentle hum on a low comfortable pitch. Let it fade.', durationSec: 90 },
      { name: 'Lip Trill Down', description: 'Lip trills sliding gently downward. Getting softer and softer.', durationSec: 90 },
      { name: 'Sigh Release', description: 'Inhale, then sigh out on AH from high to low. Release all tension.', durationSec: 60 },
      { name: 'Silent Breath', description: 'Quiet breathing for 60 seconds. Feel the voice rest.', durationSec: 60 },
    ],
  },
  // ─── Advanced programs ────────────────────────────────────────
  {
    id: 'vibrato-mastery',
    title: 'Vibrato Mastery',
    description: 'Develop, control, and refine your vibrato from scratch to performance level.',
    durationMin: 14,
    xpReward: 90,
    difficulty: 'Advanced',
    category: 'Technique',
    icon: 'waves',
    stages: [
      { name: 'Warm-Up Hum', description: 'Gentle humming on a comfortable pitch. Relax everything.', durationSec: 90 },
      { name: 'Pitch Oscillation', description: 'Sustain a note, then manually oscillate the pitch up and down very slowly. Think of a siren on a single note.', durationSec: 120 },
      { name: 'Vibrato Drill', description: 'Sustain a note with slow pitch oscillation. Gradually speed up to 5-6 cycles per second.', durationSec: 120 },
      { name: 'Vibrato On/Off', description: 'Sing a sustained note. Add vibrato for 5 seconds, then straighten for 5 seconds. Switch back and forth.', durationSec: 120 },
      { name: 'Vibrato in Scales', description: 'Sing a 5-note scale with vibrato on each note. Keep the vibrato even on every note.', durationSec: 120 },
      { name: 'Vibrato Control', description: 'Sing a sustained note with vibrato, then straighten it, then add vibrato back. Practice switching on command.', durationSec: 120 },
      { name: 'Free Vibrato', description: 'Sing a sustained note and let vibrato happen naturally. Don\'t force it. Just let it arrive.', durationSec: 90 },
    ],
  },
  {
    id: 'mix-voice-builder',
    title: 'Mix Voice Builder',
    description: 'Develop a seamless mix voice connecting chest and head registers.',
    durationMin: 16,
    xpReward: 100,
    difficulty: 'Advanced',
    category: 'Technique',
    icon: 'layers',
    stages: [
      { name: 'Warm-Up Slide', description: 'Gentle lip trills sliding through your entire range. Feel where your break is.', durationSec: 120 },
      { name: 'Chest Voice Foundation', description: 'Sing a comfortable low note in full chest voice. Feel the resonance in your chest.', durationSec: 90 },
      { name: 'Head Voice Foundation', description: 'Sing a comfortable high note in light head voice. Feel the resonance in your head.', durationSec: 90 },
      { name: 'Mix Voice Blend', description: 'Sing through your passaggio smoothly. Start in chest, blend into head voice without a break.', durationSec: 120 },
      { name: 'Nay-Nay Exercise', description: 'Sing "nay-nay-nay" on a scale through your break. The narrow vowel helps the mix connect.', durationSec: 120 },
      { name: 'Mix Belt Bridge', description: 'Sing through the passaggio with increasing intensity. Blend chest resonance into head voice with power.', durationSec: 120 },
      { name: 'Full Range Mix', description: 'Sing a 2-octave scale using mix voice throughout. No breaks, no flips.', durationSec: 120 },
      { name: 'Cool Down Hum', description: 'Gentle humming downward. Let the voice relax after the intense work.', durationSec: 90 },
    ],
  },
  {
    id: 'rock-metal-techniques',
    title: 'Rock & Metal Techniques',
    description: 'Safe distortion, twang, and aggressive vocal techniques for powerful singing.',
    durationMin: 18,
    xpReward: 120,
    difficulty: 'Advanced',
    category: 'Workout',
    icon: 'guitar',
    stages: [
      { name: 'Warm-Up', description: 'Lip trills and humming through your full range. Prepare the voice carefully.', durationSec: 120 },
      { name: 'Twang Exercise', description: 'Produce a bright, nasal tone (like a duck quack). Then apply that brightness to a sustained vowel. Builds power safely.', durationSec: 90 },
      { name: 'Safe Distortion', description: 'Add a controlled rasp to a sustained note using false cord engagement. Never push from the throat.', durationSec: 60 },
      { name: 'Distortion Scales', description: 'Sing a 5-note scale with distortion on each note. Keep the distortion consistent and safe.', durationSec: 120 },
      { name: 'Belting Safe', description: 'Sing high notes in chest-mix with bright twang. Keep the larynx neutral. If it hurts, stop immediately.', durationSec: 90 },
      { name: 'Subharmonic Bass', description: 'Sing a low note and add a lower octave below it. Creates a growling undertone. Keep it relaxed.', durationSec: 60 },
      { name: 'Aggressive Sustains', description: 'Combine twang + distortion on a sustained high note. Push from the diaphragm, never the throat.', durationSec: 90 },
      { name: 'Recovery & Cool Down', description: 'Very gentle humming and sighing. Let the voice recover fully after the intense work.', durationSec: 120 },
    ],
  },
  {
    id: 'whistle-register',
    title: 'Whistle Register Entry',
    description: 'Access and develop your whistle register with gentle, safe exercises.',
    durationMin: 10,
    xpReward: 80,
    difficulty: 'Advanced',
    category: 'Technique',
    icon: 'sparkles',
    stages: [
      { name: 'Warm-Up', description: 'Gentle humming and lip trills through your full range.', durationSec: 90 },
      { name: 'Head Voice Sirens', description: 'Glide up into your highest head voice notes. Very light air pressure.', durationSec: 120 },
      { name: 'Thinning Out', description: 'On a high head voice note, gradually thin the sound until it\'s barely audible. Let it naturally flip to whistle.', durationSec: 120 },
      { name: 'Whistle Entry', description: 'Starting from a high head voice, gently let the sound thin into a whistle tone. Very light air pressure. Do not force.', durationSec: 60 },
      { name: 'Whistle Sustain', description: 'Once you find a whistle tone, try to hold it for 5-10 seconds. Keep it extremely light.', durationSec: 90 },
      { name: 'Whistle Descend', description: 'Start in whistle and try to smoothly transition down into head voice. Practice the bridge both ways.', durationSec: 90 },
      { name: 'Cool Down', description: 'Gentle humming and sighing. The whistle register is delicate — always cool down after.', durationSec: 90 },
    ],
  },
  {
    id: 'messa-di-voce',
    title: 'Messa di Voce Master',
    description: 'The ultimate breath control challenge: swell a note from silence to full power and back.',
    durationMin: 12,
    xpReward: 110,
    difficulty: 'Advanced',
    category: 'Workout',
    icon: 'activity',
    stages: [
      { name: 'Breath Preparation', description: 'Deep belly breathing for 2 minutes. Fill completely, release slowly.', durationSec: 120 },
      { name: 'Sustained Note', description: 'Sing a comfortable note at medium volume for 30 seconds. Steady and even.', durationSec: 120 },
      { name: 'Crescendo Only', description: 'Start a note very soft, then gradually grow louder over 20 seconds. Stop at peak.', durationSec: 120 },
      { name: 'Decrescendo Only', description: 'Start a note loud, then gradually fade to silence over 20 seconds.', durationSec: 120 },
      { name: 'Messa di Voce', description: 'On a single sustained note: start pianissimo, swell to fortissimo, then fade back to pianissimo. The ultimate exercise.', durationSec: 120 },
      { name: 'Messa with Vibrato', description: 'Same as above, but add controlled vibrato as you reach peak volume.', durationSec: 120 },
      { name: 'Cool Down', description: 'Very gentle humming and sighing. Recover fully.', durationSec: 90 },
    ],
  },
  {
    id: 'ear-training-pro',
    title: 'Ear Training Pro',
    description: 'Sharpen your ability to identify and reproduce intervals, scales, and melodies.',
    durationMin: 14,
    xpReward: 85,
    difficulty: 'Advanced',
    category: 'Technique',
    icon: 'ear',
    stages: [
      { name: 'Pitch Matching', description: 'A tone will play. Sing it back immediately. Focus on exact pitch match.', durationSec: 120 },
      { name: 'Interval ID: Major', description: 'Two notes will play. Identify if it\'s a major 2nd, 3rd, 5th, or octave. Sing both notes.', durationSec: 120 },
      { name: 'Interval ID: Minor', description: 'Two notes will play. Identify minor 3rd, minor 6th, or tritone. Sing both notes.', durationSec: 120 },
      { name: 'Scale Recognition', description: 'A scale will play. Identify if it\'s major, minor, or pentatonic. Sing it back.', durationSec: 120 },
      { name: 'Melody Playback', description: 'A short 4-note melody will play. Sing it back exactly. Then try 5, then 6 notes.', durationSec: 120 },
      { name: 'Chord Singing', description: 'A chord will play. Sing the root, then the third, then the fifth.', durationSec: 120 },
      { name: 'Free Singing', description: 'Sing anything you want in key. Trust your ear.', durationSec: 90 },
    ],
  },
  {
    id: 'full-range-expansion',
    title: 'Full Range Expansion',
    description: 'Systematically extend your vocal range up and down with safe, progressive exercises.',
    durationMin: 16,
    xpReward: 95,
    difficulty: 'Advanced',
    category: 'Workout',
    icon: 'expand',
    stages: [
      { name: 'Warm-Up Sirens', description: 'Gentle lip trill sirens through your full current range. Map where you are today.', durationSec: 120 },
      { name: 'Low Range Explorer', description: 'Sing downward from your lowest comfortable note. Go as low as possible without straining.', durationSec: 120 },
      { name: 'Chest Voice Stretch', description: 'Sing up a scale in chest voice, going one note higher than comfortable. Lighten just before the break.', durationSec: 120 },
      { name: 'Expanded Siren', description: 'Glide from your lowest note to your highest and back. Cover your entire range in one smooth motion.', durationSec: 120 },
      { name: 'High Note Sustains', description: 'Sing your highest comfortable note and hold it. Then try one semitone higher. Repeat.', durationSec: 120 },
      { name: 'Two-Octave Run', description: 'Run up two octaves as fast as possible, then back down. Covers your full range.', durationSec: 120 },
      { name: 'Range Test', description: 'Sing your absolute highest and lowest notes. Hold each for 10 seconds. Track your range over time.', durationSec: 120 },
      { name: 'Cool Down', description: 'Gentle humming downward. Let the voice recover.', durationSec: 90 },
    ],
  },
];

// ─── Custom Program Storage ──────────────────────────────────────

const CUSTOM_PROGRAMS_KEY = 'vocal_hero_custom_programs';

export function getCustomPrograms(): TrainingProgram[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROGRAMS_KEY);
    if (raw) return JSON.parse(raw) as TrainingProgram[];
  } catch { /* ignore */ }
  return [];
}

export function saveCustomProgram(program: TrainingProgram): void {
  const existing = getCustomPrograms();
  const idx = existing.findIndex((p) => p.id === program.id);
  if (idx >= 0) {
    existing[idx] = program;
  } else {
    existing.push(program);
  }
  localStorage.setItem(CUSTOM_PROGRAMS_KEY, JSON.stringify(existing));
}

export function deleteCustomProgram(id: string): void {
  const existing = getCustomPrograms().filter((p) => p.id !== id);
  localStorage.setItem(CUSTOM_PROGRAMS_KEY, JSON.stringify(existing));
}

export function getAllPrograms(): TrainingProgram[] {
  return [...TRAINING_PROGRAMS, ...getCustomPrograms()];
}
