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
