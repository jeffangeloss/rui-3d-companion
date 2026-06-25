import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, CompanionMode } from "@/lib/character-prompt";

export const runtime = "nodejs";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const OLLAMA_TEMPERATURE = Number(process.env.OLLAMA_TEMPERATURE ?? "0.8");

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBody {
  messages: IncomingMessage[];
  mode?: CompanionMode;
}

/**
 * Proxies the conversation to a local Ollama instance, prepending Rui's
 * mode-aware system prompt. Returns `{ reply }`.
 */
export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  if (history.length === 0) {
    return NextResponse.json(
      { error: "messages[] is required" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(body.mode ?? "teatro");

  const payload = {
    model: OLLAMA_MODEL,
    stream: false,
    options: { temperature: OLLAMA_TEMPERATURE },
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        {
          error: `Ollama responded ${res.status}. Is it running and is the model "${OLLAMA_MODEL}" pulled?`,
          detail,
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      message?: { content?: string };
    };
    const reply = data.message?.content?.trim() ?? "";
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Could not reach Ollama. Start it with `ollama serve` and set OLLAMA_BASE_URL.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }
}
