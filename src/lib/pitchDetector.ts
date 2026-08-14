import { audioService } from './audioService';

export type PitchDetectionCallback = (frequency: number, confidence: number) => void;

const MIN_FREQ = 70;
const MAX_FREQ = 1000;
const BUFFER_SIZE = 2048;
const RMS_THRESHOLD = 0.008;

export class PitchDetector {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;
  private rafId: number | null = null;
  private running = false;

  async start(onPitch: PitchDetectionCallback): Promise<void> {
    if (this.running) return;

    this.audioCtx = await audioService.ensureContext();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone API not available in this browser.');
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    // Re-resume the context — getUserMedia can cause iOS to suspend it
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = BUFFER_SIZE;
    this.analyser.smoothingTimeConstant = 0;
    this.source.connect(this.analyser);
    this.buffer = new Float32Array(new ArrayBuffer(this.analyser.fftSize * 4));

    this.running = true;
    this.loop(onPitch);
  }

  private loop(onPitch: PitchDetectionCallback): void {
    if (!this.running || !this.analyser || !this.buffer) return;

    this.analyser.getFloatTimeDomainData(this.buffer);

    const freq = this.detectPitch(this.buffer);
    if (freq > 0) {
      onPitch(freq, 1);
    } else {
      onPitch(0, 0);
    }

    this.rafId = requestAnimationFrame(() => this.loop(onPitch));
  }

  private detectPitch(buffer: Float32Array): number {
    const SIZE = buffer.length;

    // RMS check — reject silence
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < RMS_THRESHOLD) return -1;

    return this.autocorrelate(buffer);
  }

  private autocorrelate(buf: Float32Array): number {
    const SIZE = buf.length;
    const sampleRate = this.audioCtx?.sampleRate ?? 44100;

    // Remove DC offset (mean) so correlation is meaningful
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
    if (energy <= 0) return -1;

    const minOffset = Math.floor(sampleRate / MAX_FREQ);
    const maxOffset = Math.min(Math.floor(sampleRate / MIN_FREQ), SIZE - 1);

    let bestCorrelation = -1;
    let bestOffset = -1;

    const correlations: number[] = new Array(maxOffset + 1);

    for (let offset = minOffset; offset <= maxOffset; offset++) {
      let correlation = 0;
      for (let i = 0; i < SIZE - offset; i++) {
        correlation += normalized[i] * normalized[i + offset];
      }
      // Normalize by the energy so correlation is in [-1, 1]
      correlation = correlation / energy;
      correlations[offset] = correlation;

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }

    // Need a reasonably strong periodic signal
    if (bestCorrelation < 0.5) return -1;

    // Parabolic interpolation around the peak for sub-sample accuracy
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
    if (freq < MIN_FREQ || freq > MAX_FREQ) return -1;
    return freq;
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    this.audioCtx = null;
    this.buffer = null;
  }

  get isRunning(): boolean {
    return this.running;
  }
}
