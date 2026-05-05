let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;

export function initAudio(): boolean {
  if (audioCtx) return true;
  try {
    audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 1;
    return true;
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  if (gainNode) {
    gainNode.gain.value = muted ? 0 : 1;
  }
}

export function playSubdivisions(subdivisions: number[], bpm: number): void {
  if (!audioCtx || !gainNode || subdivisions.length === 0) return;

  const beatDuration = 60 / bpm;
  const now = audioCtx.currentTime;

  for (const offset of subdivisions) {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.connect(env);
    env.connect(gainNode);

    osc.type = 'square';
    osc.frequency.value = 880;

    const startTime = now + offset * beatDuration;
    env.gain.setValueAtTime(0.3, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }
}

export function playClick(): void {
  if (!audioCtx || !gainNode) return;

  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.connect(env);
  env.connect(gainNode);

  osc.type = 'sine';
  osc.frequency.value = 660;

  const now = audioCtx.currentTime;
  env.gain.setValueAtTime(0.2, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.start(now);
  osc.stop(now + 0.06);
}
