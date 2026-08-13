import { audioService } from './audioService';

export type PitchDetectionCallback = (frequency: number, confidence: number) => void;

const MIN_FREQ = 70;
const MAX_FREQ = 1000;
const BUFFER_SIZE = 2048;

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

    // Use the shared AudioContext from audioService so iOS only has one context
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
      // Fallback: iOS sometimes rejects constrained audio — try plain audio: true
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = BUFFER_SIZE;
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

    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    const bestOffset = this.autocorrelate(buffer);
    if (bestOffset === -1) return -1;

    const sampleRate = this.audioCtx?.sampleRate ?? 44100;
    const freq = sampleRate / bestOffset;
    if (freq < MIN_FREQ || freq > MAX_FREQ) return -1;
    return freq;
  }

  private autocorrelate(buf: Float32Array): number {
    const SIZE = buf.length;
    const sampleRate = this.audioCtx?.sampleRate ?? 44100;

    const minOffset = Math.floor(sampleRate / MAX_FREQ);
    const maxOffset = Math.floor(sampleRate / MIN_FREQ);

    let bestCorrelation = 0;
    let bestOffset = -1;
    let foundGoodCorrelation = false;
    const correlations: number[] = [];

    for (let offset = minOffset; offset <= maxOffset && offset < SIZE; offset++) {
      let correlation = 0;
      for (let i = 0; i < SIZE - offset; i++) {
        correlation += buf[i] * buf[i + offset];
      }
      correlation = correlation / (SIZE - offset);
      correlations.push(correlation);

      if (correlation > 0.9 && correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
        foundGoodCorrelation = true;
      } else if (foundGoodCorrelation && correlation < bestCorrelation) {
        const shift =
          (correlations[correlations.length - 2] -
            correlations[correlations.length - 1] * 2 -
            correlations[correlations.length - 3]) /
          (2 * (correlations[correlations.length - 1] - correlations[correlations.length - 3]));
        return bestOffset + shift;
      }
    }

    if (bestCorrelation > 0.01) {
      return bestOffset;
    }

    return -1;
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
    // Do NOT close the shared AudioContext — audioService owns it.
    this.audioCtx = null;
    this.buffer = null;
  }

  get isRunning(): boolean {
    return this.running;
  }
}
