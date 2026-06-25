# Rui — 3D Companion 🎭

> **This is a private fan project for personal use only.**
> **No official Project SEKAI assets, voices, models, or copyrighted materials are included in this repository.**

A private, local-first 3D virtual companion. Rui is a theatrical, inventive,
eccentric character who keeps **Gaby** company — to study, to relax, or just to
talk — speaking with energy and a flair for the dramatic.

Everything runs **on your own machine**: the language model (Ollama), the voice
(Piper), and the transcription (Whisper). Nothing is sent to the cloud.

---

## ✨ Features (MVP)

1. **3D stage** rendered with React Three Fiber.
2. **VRM avatar** loaded in the browser (`@pixiv/three-vrm`).
3. **Side chat panel** to talk with Rui.
4. **Local AI** responses via **Ollama**.
5. **Text-to-speech** via **Piper**.
6. **Idle animation** + facial expression while speaking.
7. **Simple volume-based lip sync** (Rhubarb upgrade planned).
8. **Voice mode** — Gaby speaks, Whisper transcribes, Rui replies out loud.

## 🎬 Companion modes

| Mode | What Rui does |
|------|----------------|
| **Teatro** | Replies as if presenting a show. |
| **Estudio** | Explains topics, motivates, asks questions. |
| **Comfort** | Soft phrases, calm company and conversation. |
| **Laboratorio** | Proposes weird/fun ideas. |
| **Escenario** | Changes background, lighting and pose. |
| **Voz** | Full voice loop: speak → transcribe → reply → speak. |

---

## 🧱 Tech stack

- **Next.js (App Router)** + TypeScript
- **React Three Fiber** + **drei** + **@pixiv/three-vrm**
- **Zustand** for state
- **Tailwind CSS** for the UI
- Local services: **Ollama**, **Piper**, **Whisper**

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure your local services
cp .env.example .env.local
#    …then edit .env.local (Ollama model, Piper voice path, Whisper endpoint).

# 3. Drop your private VRM model in place (kept out of git):
#    public/models/rui-local.vrm
#    See public/models/README.md for details.

# 4. Run the dev server
npm run dev
# open http://localhost:3000
```

### Local services you need running

| Service | Purpose | Quick start |
|---------|---------|-------------|
| [Ollama](https://ollama.com) | Chat LLM | `ollama serve` + `ollama pull llama3.1` |
| [Piper](https://github.com/rhasspy/piper) | TTS | download a voice, set `PIPER_MODEL` |
| [Whisper server](https://github.com/fedirz/faster-whisper-server) | STT | run an OpenAI-compatible endpoint, set `WHISPER_HTTP_URL` |

All three are **optional for first boot** — the UI degrades gracefully if a
service is offline (you just lose that capability and see a clear message).

---

## 📁 Project structure

```
src/
  app/                 # Next.js routes + API routes
    page.tsx           # landing
    companion/page.tsx # the live companion experience
    api/chat|tts|stt|lipsync
  components/
    avatar/            # 3D scene, VRM model, expressions, controls
    chat/              # chat panel + message bubble
    voice/             # recorder, player, lip-sync controller
  lib/                 # character prompt, voice helpers, lipsync, avatar config
  store/               # zustand companion store
public/
  models/ animations/ backgrounds/ audio/   # private assets (gitignored)
```

## 🛣️ Roadmap

- [ ] Swap volume-based lip sync for **Rhubarb** viseme tracks (`/api/lipsync`).
- [ ] Idle/gesture animations from `.vrma` clips.
- [ ] Per-mode backgrounds & lighting presets.
- [ ] Streaming chat responses.

## ⚖️ License

Private / All rights reserved — see [LICENSE](./LICENSE).
This is a private fan project for personal use only. No official Project SEKAI
assets, voices, models, or copyrighted materials are included in this repository.
