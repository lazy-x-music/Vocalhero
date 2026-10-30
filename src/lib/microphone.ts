let streamPromise: Promise<MediaStream> | null = null;

async function openStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone API not available in this browser.');
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false,
    });
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  }
}

/** Opens the microphone once and keeps it alive for the whole app session. */
export function ensureMicrophoneStream(): Promise<MediaStream> {
  if (!streamPromise) {
    streamPromise = openStream().catch((err) => {
      streamPromise = null;
      throw err;
    });
  }
  return streamPromise;
}
