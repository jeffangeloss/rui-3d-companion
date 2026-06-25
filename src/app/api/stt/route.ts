import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const WHISPER_HTTP_URL =
  process.env.WHISPER_HTTP_URL?.trim() ||
  "http://localhost:8000/v1/audio/transcriptions";
const WHISPER_MODEL =
  process.env.WHISPER_MODEL?.trim() || "Systran/faster-whisper-base";
const WHISPER_LANGUAGE = process.env.WHISPER_LANGUAGE?.trim();

/**
 * Speech-to-text. Forwards the uploaded audio to a local, OpenAI-compatible
 * Whisper endpoint (e.g. faster-whisper-server, whisper.cpp server) and returns
 * `{ text }`.
 */
export async function POST(req: NextRequest) {
  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a 'file' field" },
      { status: 400 }
    );
  }

  const file = incoming.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Missing 'file' (audio) in form data" },
      { status: 400 }
    );
  }

  const outgoing = new FormData();
  outgoing.append("file", file, "recording.webm");
  outgoing.append("model", WHISPER_MODEL);
  outgoing.append("response_format", "json");
  if (WHISPER_LANGUAGE) outgoing.append("language", WHISPER_LANGUAGE);

  try {
    const res = await fetch(WHISPER_HTTP_URL, {
      method: "POST",
      body: outgoing,
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        {
          error: `Whisper server responded ${res.status}. Is it running at WHISPER_HTTP_URL?`,
          detail,
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { text?: string };
    return NextResponse.json({ text: (data.text ?? "").trim() });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Could not reach the Whisper server. Start one and set WHISPER_HTTP_URL.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }
}
