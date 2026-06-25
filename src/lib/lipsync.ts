/**
 * Lip sync.
 *
 * MVP strategy (step 7): drive the mouth from the live audio volume using a Web
 * Audio AnalyserNode. Cheap, no preprocessing, works for any audio.
 *
 * Planned upgrade (step 8): Rhubarb Lip-Sync produces a timed sequence of
 * visemes from an audio file. The `RhubarbCue` types + `sampleVisemeTrack`
 * helper below are ready for when `/api/lipsync` returns a real track.
 */

/**
 * Wraps a media element in a Web Audio graph and exposes a normalized 0..1
 * "mouth openness" value derived from short-term RMS volume.
 */
export class VolumeLipSync {
  private ctx: AudioContext;
  private analyser: AnalyserNode;
  private source: MediaElementAudioSourceNode;
  private data: Uint8Array<ArrayBuffer>;
  private smoothed = 0;

  /** Higher = mouth reacts faster but jitterier. 0..1 */
  smoothing = 0.4;
  /** Scales raw RMS so normal speech reaches a wide-open mouth. */
  gain = 1.8;

  constructor(media: HTMLMediaElement, ctx?: AudioContext) {
    this.ctx = ctx ?? new AudioContext();
    this.source = this.ctx.createMediaElementSource(media);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.data = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));

    // media -> analyser -> speakers
    this.source.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  /** Resume the context (must be called from a user gesture on some browsers). */
  async resume(): Promise<void> {
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  /** Current smoothed mouth openness in 0..1. Call once per animation frame. */
  sample(): number {
    this.analyser.getByteTimeDomainData(this.data);

    // RMS of the waveform around the 128 midpoint.
    let sumSq = 0;
    for (let i = 0; i < this.data.length; i++) {
      const v = (this.data[i] - 128) / 128;
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / this.data.length);
    const target = Math.min(1, rms * this.gain);

    this.smoothed += (target - this.smoothed) * this.smoothing;
    return this.smoothed;
  }

  dispose(): void {
    try {
      this.source.disconnect();
      this.analyser.disconnect();
    } catch {
      /* already disconnected */
    }
    // Don't close a shared context the caller may reuse.
    if (this.ctx.state !== "closed") {
      void this.ctx.close().catch(() => undefined);
    }
  }
}

// ── Rhubarb (future) ───────────────────────────────────────────────────────

/** A single Rhubarb mouth cue. `value` is a viseme letter A–H / X. */
export interface RhubarbCue {
  start: number; // seconds
  value: string; // Rhubarb mouth shape id
}

export interface VisemeTrack {
  cues: RhubarbCue[];
}

/**
 * Maps Rhubarb viseme letters to an approximate mouth-open amount, so the same
 * volume-driven rig can render a precomputed track without new bones.
 */
const RHUBARB_OPENNESS: Record<string, number> = {
  X: 0.0, // closed / rest
  A: 0.1, // closed-ish (M, B, P)
  B: 0.25,
  C: 0.5,
  D: 0.8, // wide open (A)
  E: 0.4,
  F: 0.3,
  G: 0.35,
  H: 0.6,
};

/** Get mouth openness (0..1) for a given time from a Rhubarb track. */
export function sampleVisemeTrack(track: VisemeTrack, timeSec: number): number {
  const { cues } = track;
  if (!cues.length) return 0;

  // Find the last cue whose start <= time.
  let lo = 0;
  let hi = cues.length - 1;
  let idx = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].start <= timeSec) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return RHUBARB_OPENNESS[cues[idx].value] ?? 0;
}
