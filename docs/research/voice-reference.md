# Voice reference

> **No official voice, no voice cloning of the seiyuu / voice actor.** Use only
> open-source or clearly-licensed TTS voices.

## Target voice character (for an ORIGINAL voice)

- Young, **male**, theatrical timbre.
- Playful, warm energy with an elegant edge.
- Pace: calm → animated depending on the moment (medium default).
- Pitch: medium-high.
- Emotional range: playful, gentle, excited, mysterious.

## MVP — browser TTS (zero setup)

- Uses the Web Speech API (`window.speechSynthesis`).
- Prefers a Spanish (`es-*`) voice when available.
- Config: pitch ≈ 1.15, rate ≈ 1.0, normal volume.
- Mouth movement is driven by a simple time-based oscillation while speaking
  (placeholder lip sync).
- Implemented in `src/components/voice/VoicePlayer.tsx` (browser engine) and
  `src/lib/voice.ts` (`speakWithBrowserTTS`).

## Production — Piper (local neural TTS)

- Endpoint: `POST /api/tts` → returns `audio/wav`.
- Spawns the Piper binary or proxies a Piper HTTP server (`.env.local`).
- Audio is analysed in the browser for **volume-based lip sync**
  (`VolumeLipSync` in `src/lib/lipsync.ts`).
- Pick an open-source Piper voice from
  https://huggingface.co/rhasspy/piper-voices — **not** an official voice line.

## Rules

- Never use official voice lines inside the product.
- Never clone the official voice.
- Document the chosen TTS voice's license alongside the model file.
