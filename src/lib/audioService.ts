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
   * Play a single vocal-style note using formant synthesis.
   * A sawtooth oscillator (rich harmonics) is shaped by three
   * bandpass filters tuned to vowel formant frequencies, producing
   * an "AH"-like vocal tone that's easy to imitate.
   */
  private playSynthNote(freq: number, start: number, dur: number, peakGain: number): void {
    const ctx = this.ctx!;
    const master = this.masterGain!;

    // "AH" vowel formants (Hz) — F1, F2, F3
    const formants = [800, 1150, 2900];
    const formantQs = [8, 10, 12];
    const formantGains = [1.0, 0.5, 0.25];

    // Sawtooth has rich harmonics for the formants to sculpt
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth' as OscillatorType;
    osc.frequency.value = freq;

    // Sub oscillator for body
    const sub = ctx.createOscillator();
    sub.type = 'sine' as OscillatorType;
    sub.frequency.value = freq * 0.5;

    const oscGain = ctx.createGain();
    const subGain = ctx.createGain();

    const attack = Math.min(0.05, dur * 0.2);
    const release = Math.min(0.15, dur * 0.35);

    oscGain.gain.setValueAtTime(0, start);
    oscGain.gain.linearRampToValueAtTime(peakGain, start + attack);
    oscGain.gain.setValueAtTime(peakGain, start + dur - release);
    oscGain.gain.linearRampToValueAtTime(0, start + dur);

    subGain.gain.setValueAtTime(0, start);
    subGain.gain.linearRampToValueAtTime(peakGain * 0.15, start + attack);
    subGain.gain.setValueAtTime(peakGain * 0.15, start + dur - release);
    subGain.gain.linearRampToValueAtTime(0, start + dur);

    // Create formant bandpass filters in parallel
    const formantNodes = formants.map((fFreq, i) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass' as BiquadFilterType;
      bp.frequency.value = fFreq;
      bp.Q.value = formantQs[i];
      const fGain = ctx.createGain();
      fGain.gain.value = formantGains[i];
      bp.connect(fGain);
      fGain.connect(master);
      return bp;
    });

    // Slight vibrato for naturalness
    const lfo = ctx.createOscillator();
    lfo.type = 'sine' as OscillatorType;
    lfo.frequency.value = 5.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = freq * 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(oscGain);
    sub.connect(subGain);
    oscGain.connect(master);
    subGain.connect(master);
    for (const fn of formantNodes) {
      oscGain.connect(fn);
    }

    osc.start(start);
    sub.start(start);
    lfo.start(start);
    osc.stop(start + dur + 0.05);
    sub.stop(start + dur + 0.05);
    lfo.stop(start + dur + 0.05);
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
