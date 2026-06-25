import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const PIPER_HTTP_URL = process.env.PIPER_HTTP_URL?.trim();
const PIPER_MODEL = process.env.PIPER_MODEL?.trim();
const WHISPER_HTTP_URL =
  process.env.WHISPER_HTTP_URL?.trim() ||
  "http://localhost:8000/v1/audio/transcriptions";

type ServiceState = "up" | "down" | "binary" | "unconfigured";

interface HealthReport {
  ollama: { state: ServiceState; model: string; detail?: string };
  piper: { state: ServiceState; detail?: string };
  whisper: { state: ServiceState; detail?: string };
}

/** Fetch with a hard timeout so a dead service can't hang the health check. */
async function ping(
  url: string,
  init: RequestInit = {},
  timeoutMs = 1500
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Reports reachability of the local services so the UI can show live status.
 * Never throws — each probe resolves to a state.
 */
export async function GET() {
  const report: HealthReport = {
    ollama: { state: "down", model: OLLAMA_MODEL },
    piper: { state: "down" },
    whisper: { state: "down" },
  };

  // ── Ollama ───────────────────────────────────────────────
  try {
    const res = await ping(`${OLLAMA_BASE_URL}/api/tags`);
    report.ollama.state = res.ok ? "up" : "down";
    if (!res.ok) report.ollama.detail = `HTTP ${res.status}`;
  } catch (err) {
    report.ollama.detail = err instanceof Error ? err.message : "unreachable";
  }

  // ── Piper ────────────────────────────────────────────────
  if (PIPER_HTTP_URL) {
    try {
      const res = await ping(PIPER_HTTP_URL, { method: "GET" });
      // Many Piper servers reject a bare GET; reachability is what matters.
      report.piper.state = res.status < 500 ? "up" : "down";
    } catch (err) {
      report.piper.detail = err instanceof Error ? err.message : "unreachable";
    }
  } else if (PIPER_MODEL) {
    // Spawn mode — we can't easily probe the binary here without synthesizing.
    report.piper.state = "binary";
    report.piper.detail = "spawn mode (binary)";
  } else {
    report.piper.state = "unconfigured";
    report.piper.detail = "set PIPER_MODEL or PIPER_HTTP_URL";
  }

  // ── Whisper ──────────────────────────────────────────────
  try {
    // Probe the server root (transcription endpoints reject empty GETs).
    const base = WHISPER_HTTP_URL.replace(/\/v1\/.*$/, "");
    const res = await ping(base || WHISPER_HTTP_URL, { method: "GET" });
    report.whisper.state = res.status < 500 ? "up" : "down";
  } catch (err) {
    report.whisper.detail = err instanceof Error ? err.message : "unreachable";
  }

  return NextResponse.json(report);
}
