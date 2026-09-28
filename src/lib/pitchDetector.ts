import { audioService } from './audioService';

export type PitchDetectionCallback = (frequency: number, level: number, confidence: number) => void;

const MIN_FREQ = 70;
const MAX_FREQ = 1000;
const BUFFER_SIZE = 2048;
const RMS_THRESHOLD = 0.01;
const CORRELATION_THRESHOLD = 0.9;

export class PitchDetector {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array | null = null;
  private rafId: number | null = null;
  private running = false;
  private inputLevel = 0;

  async start(onPitch: PitchDetectionCallback): Promise<void> {
    if (this.running) return;

    // Ensure AudioContext is created and resumed from the user gesture chain
    this.audioCtx = await audioService.ensureContext();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone API not available in this browser.');
    }

    // Request microphone with processing disabled for cleaner pitch detection
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch {
      // Fallback: some iOS Safari versions reject the constraints object
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    // getUserMedia can cause iOS Safari to suspend the context — resume immediately
    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Will retry on next frame; the analyser just won't produce data yet
      }
    }

    this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = BUFFER_SIZE;
    this.analyser.smoothingTimeConstant = 0.7;
    this.source.connect(this.analyser);

    // Allocate buffer once and reuse — avoid per-frame allocation
    this.buffer = new Float32Array(this.analyser.fftSize);

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

    // Re-resume if iOS suspended the context mid-session
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

    // RMS volume / input level
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < RMS_THRESHOLD) {
      return { freq: 0, level: rms, confidence: 0 };
    }

    const freq = this.autocorrelate(buffer);
    return {
      freq,
      level: rms,
      confidence: freq > 0 ? 1 : 0,
    };
  }

  private autocorrelate(buf: Float32Array): number {
    const SIZE = buf.length;
    const sampleRate = this.audioCtx?.sampleRate ?? 44100;

    // Remove DC offset
    let mean = 0;
    for (let i = 0; i < SIZE; i++) mean += buf[i];
    mean /= SIZE;

    const normalized = new Float32Array(SIZE);
    let energy = 0;
    for (let i = 0; i < SIZE; i++) {
      const v = buf[i] - mean;
      normalized[i] = v;
      energy += v * v;
    }
    if (energy <= 0) return 0;

    const minOffset = Math.floor(sampleRate / MAX_FREQ);
    const maxOffset = Math.min(Math.floor(sampleRate / MIN_FREQ), SIZE - 1);

    let bestCorrelation = -Infinity;
    let bestOffset = -1;

    const correlations = new Float32Array(maxOffset + 1);

    for (let offset = minOffset; offset <= maxOffset; offset++) {
      let correlation = 0;
      for (let i = 0; i < SIZE - offset; i++) {
        correlation += normalized[i] * normalized[i + offset];
      }
      correlation = correlation / energy;
      correlations[offset] = correlation;

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }

    if (bestCorrelation < CORRELATION_THRESHOLD || bestOffset < 0) return 0;

    // Parabolic interpolation for sub-sample accuracy
    if (bestOffset > minOffset && bestOffset < maxOffset) {
      const prev = correlations[bestOffset - 1];
      const curr = correlations[bestOffset];
      const next = correlations[bestOffset + 1];
      const denom = 2 * (2 * curr - next - prev);
      if (denom !== 0) {
        const shift = (next - prev) / denom;
        const interpolatedOffset = bestOffset + shift;
        const freq = sampleRate / interpolatedOffset;
        if (freq >= MIN_FREQ && freq <= MAX_FREQ) return freq;
      }
    }

    const freq = sampleRate / bestOffset;
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
      try {
        this.source.disconnect();
      } catch {
        // Already disconnected
      }
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {
        // Already disconnected
      }
      this.analyser = null;
    }
    // Do NOT close the AudioContext — it's owned by audioService and shared
    // with the reference tone / success sound oscillators.
    this.audioCtx = null;
    this.buffer = null;
    this.inputLevel = 0;
  }
}
