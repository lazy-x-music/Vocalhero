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

  async playReferenceTone(note: string, durationMs = 1200): Promise<void> {
    const ctx = await this.ensureContext();
    const freq = noteStringToFrequency(note);
    if (freq <= 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine' as OscillatorType;
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    const duration = durationMs / 1000;
    const attack = 0.04;
    const release = 0.25;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + attack);
    gain.gain.setValueAtTime(0.35, now + duration - release);
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

  dispose(): void {
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

export const audioService = new AudioService();
