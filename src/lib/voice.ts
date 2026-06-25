/**
 * Client-side helpers for the voice loop: send text to TTS and get audio back,
 * and send recorded audio to STT and get a transcript back.
 *
 * These call the app's own API routes (/api/tts, /api/stt) which in turn talk
 * to the local Piper / Whisper services.
 */

export interface TtsResult {
  /** Object URL for the synthesized audio (caller must revoke when done). */
  url: string;
  blob: Blob;
}

/** Synthesize speech for `text` using the local Piper voice. */
export async function synthesizeSpeech(
  text: string,
  signal?: AbortSignal
): Promise<TtsResult> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!res.ok) {
    const detail = await safeError(res);
    throw new Error(`TTS failed (${res.status}): ${detail}`);
  }

  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), blob };
}

/** Transcribe recorded audio using the local Whisper endpoint. */
export async function transcribeAudio(
  audio: Blob,
  signal?: AbortSignal
): Promise<string> {
  const form = new FormData();
  // Whisper servers key on a reasonable filename/extension.
  const filename = audio.type.includes("ogg")
    ? "recording.ogg"
    : audio.type.includes("wav")
    ? "recording.wav"
    : "recording.webm";
  form.append("file", audio, filename);

  const res = await fetch("/api/stt", {
    method: "POST",
    body: form,
    signal,
  });

  if (!res.ok) {
    const detail = await safeError(res);
    throw new Error(`STT failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

async function safeError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error ?? JSON.stringify(data);
  } catch {
    try {
      return await res.text();
    } catch {
      return res.statusText;
    }
  }
}

// ── Browser TTS (Web Speech API) ───────────────────────────────────────────
// Zero-setup fallback used by demo mode and when Piper is unreachable.

export interface BrowserTtsHandle {
  cancel: () => void;
}

export function isBrowserTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Best-effort pick of a Spanish voice (falls back to the default voice). */
function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /^es[-_]?/i.test(v.lang)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("es"))
  );
}

interface BrowserTtsCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Speak `text` with the browser's Web Speech API. Returns a handle whose
 * cancel() stops playback. onEnd fires on both natural end and error so callers
 * can always reset their speaking state.
 */
export function speakWithBrowserTTS(
  text: string,
  cb: BrowserTtsCallbacks = {}
): BrowserTtsHandle {
  if (!isBrowserTtsAvailable()) {
    cb.onError?.(new Error("Web Speech API no disponible en este navegador"));
    cb.onEnd?.();
    return { cancel: () => undefined };
  }

  const synth = window.speechSynthesis;
  synth.cancel(); // stop anything already queued

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "es-ES";
  const voice = pickSpanishVoice();
  if (voice) utter.voice = voice;
  utter.pitch = 1.15; // medium-high, theatrical
  utter.rate = 1.0;
  utter.volume = 1;

  utter.onstart = () => cb.onStart?.();
  utter.onend = () => cb.onEnd?.();
  utter.onerror = () => {
    cb.onError?.(new Error("speechSynthesis error"));
    cb.onEnd?.();
  };

  synth.speak(utter);
  return { cancel: () => synth.cancel() };
}

/** Pick a MediaRecorder mime type the current browser actually supports. */
export function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}
