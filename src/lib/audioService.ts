import { noteStringToFrequency } from './noteUtils';

type OscillatorType = 'sine' | 'triangle' | 'square' | 'sawtooth';

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore — will retry on next user gesture */
      }
    }
    return this.ctx;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  async playReferenceTone(note: string, durationMs = 1500): Promise<void> {
    const ctx = await this.ensureContext();
    if (ctx.state !== 'running') {
      try { await ctx.resume(); } catch { /* will retry */ }
    }
    const freq = noteStringToFrequency(note);
    if (freq <= 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use 'triangle' — richer harmonics make the tone more audible on
    // phone speakers which often cut low sine frequencies
    osc.type = 'triangle' as OscillatorType;
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    const duration = durationMs / 1000;
    const attack = 0.05;
    const release = 0.3;

    // Louder peak (0.6 through 0.5 master = 0.3 effective) — was 0.35 * 0.5 = 0.175
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.6, now + attack);
    gain.gain.setValueAtTime(0.6, now + duration - release);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  async playSuccessSound(): Promise<void> {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle' as OscillatorType;
      osc.frequency.value = freq;

      const start = now + i * 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  async playUiClick(): Promise<void> {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine' as OscillatorType;
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  async playPerfectRunSound(): Promise<void> {
    const ctx = await this.ensureContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle' as OscillatorType;
      osc.frequency.value = freq;
      const start = now + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend();
    }
  }

  /**
   * Play a single rich synth note at an absolute time.
   * Uses dual oscillators (fundamental + octave) through a lowpass
   * filter for a warm, flute-like tone that sounds good on phone speakers.
   */
  private playSynthNote(freq: number, start: number, dur: number, peakGain: number): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;

    // Lowpass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4, start);
    filter.frequency.exponentialRampToValueAtTime(freq * 2, start + dur);
    filter.Q.value = 1;

    // Fundamental oscillator
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle' as OscillatorType;
    osc1.frequency.value = freq;

    // Octave-up for brightness (lower gain)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine' as OscillatorType;
    osc2.frequency.value = freq * 2;

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    const attack = Math.min(0.04, dur * 0.15);
    const release = Math.min(0.12, dur * 0.3);

    gain1.gain.setValueAtTime(0, start);
    gain1.gain.linearRampToValueAtTime(peakGain, start + attack);
    gain1.gain.setValueAtTime(peakGain, start + dur - release);
    gain1.gain.linearRampToValueAtTime(0, start + dur);

    gain2.gain.setValueAtTime(0, start);
    gain2.gain.linearRampToValueAtTime(peakGain * 0.3, start + attack);
    gain2.gain.setValueAtTime(peakGain * 0.3, start + dur - release);
    gain2.gain.linearRampToValueAtTime(0, start + dur);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(master);

    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + dur + 0.05);
    osc2.stop(start + dur + 0.05);
  }

  /**
   * Play an entire riff melody as a preview — all notes sequenced with
   * their timings relative to startAtSec.
   */
  playRiffMelody(
    notes: { note: string; time: number; duration: number }[],
    startAtSec: number
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    for (const n of notes) {
      const freq = noteStringToFrequency(n.note);
      if (freq <= 0) continue;
      this.playSynthNote(freq, startAtSec + n.time, n.duration, 0.5);
    }
  }

  /**
   * Play a short, quiet guide tone for a single note — used during
   * gameplay as notes enter the hit zone.
   */
  playGuideTone(note: string, durationMs = 400): void {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    const freq = noteStringToFrequency(note);
    if (freq <= 0) return;

    this.playSynthNote(freq, ctx.currentTime, durationMs / 1000, 0.2);
  }

  /**
   * Schedule a metronome click track. Each click is a short noise burst.
   * Returns nothing — the caller should call stopClickTrack to silence
   * any remaining scheduled clicks (though they auto-stop via envelopes).
   */
  private clickOscs: OscillatorNode[] = [];

  playClickTrack(bpm: number, startAtSec: number, totalDurationSec: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    const beatInterval = 60 / bpm;
    const numBeats = Math.ceil(totalDurationSec / beatInterval);

    this.clickOscs = [];
    for (let i = 0; i < numBeats; i++) {
      const beatTime = startAtSec + i * beatInterval;
      if (beatTime > startAtSec + totalDurationSec) break;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine' as OscillatorType;
      osc.frequency.value = i % 4 === 0 ? 1200 : 800;

      gain.gain.setValueAtTime(0, beatTime);
      gain.gain.linearRampToValueAtTime(i % 4 === 0 ? 0.12 : 0.06, beatTime + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(beatTime);
      osc.stop(beatTime + 0.05);

      this.clickOscs.push(osc);
    }
  }

  stopClickTrack(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    for (const osc of this.clickOscs) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.clickOscs = [];
  }

  dispose(): void {
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

export const audioService = new AudioService();
