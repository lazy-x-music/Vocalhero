import { audioService } from './audioService';
import { ensureMicrophoneStream } from './microphone';

export type PitchDetectionCallback = (frequency: number, level: number, confidence: number) => void;

const MIN_FREQ = 65;
const MAX_FREQ = 1000;
const BUFFER_SIZE = 4096;
const RMS_THRESHOLD = 0.015;
const YIN_THRESHOLD = 0.15;

export class PitchDetector {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array | null = null;
  private yinBuffer: Float32Array | null = null;
  private rafId: number | null = null;
  private running = false;
  private inputLevel = 0;
  private lastFreq = 0;

  async start(onPitch: PitchDetectionCallback): Promise<void> {
    if (this.running) return;

    this.audioCtx = await audioService.ensureContext();

    this.mediaStream = await ensureMicrophoneStream();

    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Will retry on next animation frame
      }
    }

    this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = BUFFER_SIZE;
    // No smoothing — we need the raw waveform for accurate autocorrelation/YIN
    this.analyser.smoothingTimeConstant = 0;
    this.source.connect(this.analyser);

    const fftSize = this.analyser.fftSize;
    this.buffer = new Float32Array(fftSize);
    // YIN difference function buffer is half the size
    this.yinBuffer = new Float32Array(fftSize / 2);

    this.running = true;
    this.loop(onPitch);
  }

  get currentLevel(): number {
    return this.inputLevel;
  }

  get isRunning(): boolean {
    return this.running;
  }

  private loop(onPitch: PitchDetectionCallback): void {
    if (!this.running || !this.analyser || !this.buffer) return;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }

    this.analyser.getFloatTimeDomainData(this.buffer as Float32Array<ArrayBuffer>);

    const { freq, level, confidence } = this.analyze(this.buffer);
    this.inputLevel = level;
    onPitch(freq, level, confidence);

    this.rafId = requestAnimationFrame(() => this.loop(onPitch));
  }

  private analyze(buffer: Float32Array): { freq: number; level: number; confidence: number } {
    const SIZE = buffer.length;

    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < RMS_THRESHOLD) {
      return { freq: 0, level: rms, confidence: 0 };
    }

    const freq = this.yinDetect(buffer);
    if (freq <= 0) {
      return { freq: 0, level: rms, confidence: 0 };
    }

    // Octave-jump suppression: if new detection is ~2x or ~0.5x the last
    // stable frequency (i.e. ±1200 cents), trust the previous reading
    // for a few frames rather than jumping. This prevents the common
    // autocorrelation/YIN artifact of locking onto a harmonic.
    if (this.lastFreq > 0) {
      const ratio = freq / this.lastFreq;
      if (ratio > 1.8 && ratio < 2.2) {
        // Octave-up jump — reject, keep last
        return { freq: this.lastFreq, level: rms, confidence: 0.5 };
      }
      if (ratio > 0.45 && ratio < 0.55) {
        // Octave-down jump — reject, keep last
        return { freq: this.lastFreq, level: rms, confidence: 0.5 };
      }
    }

    this.lastFreq = freq;
    return { freq, level: rms, confidence: 1 };
  }

  /**
   * YIN pitch detection algorithm.
   * Step 1: Difference function d(tau) = sum (x[j] - x[j+tau])^2
   * Step 2: Cumulative mean normalized difference function d'(tau)
   * Step 3: Absolute threshold — pick first tau where d'(tau) < threshold
   * Step 4: Parabolic interpolation around the minimum
   */
  private yinDetect(buf: Float32Array): number {
    const SIZE = buf.length;
    const halfSize = SIZE / 2;
    const sampleRate = this.audioCtx?.sampleRate ?? 44100;
    const yin = this.yinBuffer!;

    const minTau = Math.floor(sampleRate / MAX_FREQ);
    const maxTau = Math.min(Math.floor(sampleRate / MIN_FREQ), halfSize - 1);

    // Step 1: Difference function
    for (let tau = 0; tau < halfSize; tau++) {
      let sum = 0;
      for (let i = 0; i < halfSize; i++) {
        const diff = buf[i] - buf[i + tau];
        sum += diff * diff;
      }
      yin[tau] = sum;
    }

    // Step 2: Cumulative mean normalized difference
    yin[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < halfSize; tau++) {
      runningSum += yin[tau];
      yin[tau] = yin[tau] / (runningSum / tau);
    }

    // Step 3: Absolute threshold — find first dip below threshold
    let bestTau = -1;
    for (let tau = minTau; tau <= maxTau; tau++) {
      if (yin[tau] < YIN_THRESHOLD) {
        // Find the local minimum in this valley
        while (tau + 1 <= maxTau && yin[tau + 1] < yin[tau]) {
          tau++;
        }
        bestTau = tau;
        break;
      }
    }

    if (bestTau < 0) return 0;

    // Step 4: Parabolic interpolation
    if (bestTau > minTau && bestTau < maxTau) {
      const prev = yin[bestTau - 1];
      const curr = yin[bestTau];
      const next = yin[bestTau + 1];
      const denom = 2 * (2 * curr - next - prev);
      if (denom !== 0) {
        const shift = (next - prev) / denom;
        const interpolatedTau = bestTau + shift;
        const freq = sampleRate / interpolatedTau;
        if (freq >= MIN_FREQ && freq <= MAX_FREQ) return freq;
      }
    }

    const freq = sampleRate / bestTau;
    if (freq < MIN_FREQ || freq > MAX_FREQ) return 0;
    return freq;
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.source) {
      try { this.source.disconnect(); } catch { /* already disconnected */ }
      this.source = null;
    }
    this.mediaStream = null;
    if (this.analyser) {
      try { this.analyser.disconnect(); } catch { /* already disconnected */ }
      this.analyser = null;
    }
    this.audioCtx = null;
    this.buffer = null;
    this.yinBuffer = null;
    this.inputLevel = 0;
    this.lastFreq = 0;
  }
}
