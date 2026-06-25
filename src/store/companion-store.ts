/**
 * Central Zustand store for the companion experience.
 *
 * Holds the chat transcript, the active mode, the current stage preset, and the
 * live avatar signals (emotion + mouth openness) that the 3D scene reads each
 * frame. Components write here; the avatar reads here. Keeping the per-frame
 * `mouthOpen` in zustand is fine because the avatar samples it inside its own
 * useFrame loop rather than re-rendering React on every change.
 */

import { create } from "zustand";
import {
  CompanionMode,
  DEFAULT_MODE,
} from "@/lib/character-prompt";
import { DEFAULT_PRESET_ID, EmotionName } from "@/lib/avatar-config";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export type AvatarStatus = "idle" | "thinking" | "speaking";

interface CompanionState {
  // ── Chat ────────────────────────────────────────────────
  messages: ChatMessage[];
  isThinking: boolean;
  addMessage: (role: ChatMessage["role"], content: string) => ChatMessage;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  setThinking: (v: boolean) => void;

  // ── Mode & stage ────────────────────────────────────────
  mode: CompanionMode;
  setMode: (mode: CompanionMode) => void;
  presetId: string;
  setPreset: (id: string) => void;

  // ── Avatar live signals ─────────────────────────────────
  status: AvatarStatus;
  setStatus: (s: AvatarStatus) => void;
  emotion: EmotionName;
  setEmotion: (e: EmotionName) => void;
  /** 0..1 mouth openness, written by the lip-sync controller each frame. */
  mouthOpen: number;
  setMouthOpen: (v: number) => void;

  // ── Voice ───────────────────────────────────────────────
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  isRecording: boolean;
  setRecording: (v: boolean) => void;

  // ── Avatar load state ───────────────────────────────────
  avatarReady: boolean;
  avatarError: string | null;
  setAvatarReady: (v: boolean) => void;
  setAvatarError: (msg: string | null) => void;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  // Avoid Date.now()/Math.random() at module load; this is monotonic per session.
  return `m${idCounter}`;
}

export const useCompanionStore = create<CompanionState>((set, get) => ({
  // ── Chat ────────────────────────────────────────────────
  messages: [],
  isThinking: false,
  addMessage: (role, content) => {
    const msg: ChatMessage = {
      id: nextId(),
      role,
      content,
      createdAt: typeof performance !== "undefined" ? performance.now() : 0,
    };
    set((s) => ({ messages: [...s.messages, msg] }));
    return msg;
  },
  updateMessage: (id, content) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content } : m)),
    })),
  clearMessages: () => set({ messages: [] }),
  setThinking: (v) => set({ isThinking: v }),

  // ── Mode & stage ────────────────────────────────────────
  mode: DEFAULT_MODE,
  setMode: (mode) => set({ mode }),
  presetId: DEFAULT_PRESET_ID,
  setPreset: (presetId) => set({ presetId }),

  // ── Avatar live signals ─────────────────────────────────
  status: "idle",
  setStatus: (status) => set({ status }),
  emotion: "neutral",
  setEmotion: (emotion) => set({ emotion }),
  mouthOpen: 0,
  setMouthOpen: (mouthOpen) => {
    // Skip no-op writes to avoid waking subscribers unnecessarily.
    if (get().mouthOpen !== mouthOpen) set({ mouthOpen });
  },

  // ── Voice ───────────────────────────────────────────────
  voiceEnabled: false,
  setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
  isRecording: false,
  setRecording: (isRecording) => set({ isRecording }),

  // ── Avatar load state ───────────────────────────────────
  avatarReady: false,
  avatarError: null,
  setAvatarReady: (avatarReady) => set({ avatarReady }),
  setAvatarError: (avatarError) => set({ avatarError }),
}));
