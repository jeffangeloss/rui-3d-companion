import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";

export const runtime = "nodejs";

const PIPER_HTTP_URL = process.env.PIPER_HTTP_URL?.trim();
const PIPER_BIN = process.env.PIPER_BIN?.trim() || "piper";
const PIPER_MODEL = process.env.PIPER_MODEL?.trim();
const PIPER_SPEAKER_ID = process.env.PIPER_SPEAKER_ID?.trim();

/**
 * Text-to-speech via local Piper.
 *
 * Two backends, in priority order:
 *   1. PIPER_HTTP_URL set  -> proxy the text to a Piper HTTP server.
 *   2. otherwise           -> spawn the Piper binary and stream text on stdin.
 *
 * Returns audio/wav bytes.
 */
export async function POST(req: NextRequest) {
  let text: string;
  try {
    const body = await req.json();
    text = String(body.text ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  // Keep a sane upper bound so a runaway reply can't lock up synthesis.
  if (text.length > 4000) text = text.slice(0, 4000);

  if (PIPER_HTTP_URL) {
    return synthesizeViaHttp(text);
  }
  return synthesizeViaBinary(text);
}

async function synthesizeViaHttp(text: string): Promise<Response> {
  try {
    const res = await fetch(PIPER_HTTP_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Piper HTTP server responded ${res.status}` },
        { status: 502 }
      );
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Could not reach the Piper HTTP server (PIPER_HTTP_URL).",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }
}

async function synthesizeViaBinary(text: string): Promise<Response> {
  if (!PIPER_MODEL) {
    return NextResponse.json(
      {
        error:
          "PIPER_MODEL is not set. Point it at a Piper voice .onnx file, or set PIPER_HTTP_URL.",
      },
      { status: 500 }
    );
  }

  const args = ["--model", PIPER_MODEL, "--output_file", "-"];
  if (PIPER_SPEAKER_ID) args.push("--speaker", PIPER_SPEAKER_ID);

  return new Promise<Response>((resolve) => {
    let child;
    try {
      child = spawn(PIPER_BIN, args, { stdio: ["pipe", "pipe", "pipe"] });
    } catch (err) {
      resolve(
        NextResponse.json(
          {
            error: `Failed to spawn Piper ("${PIPER_BIN}"). Is it installed and on PATH?`,
            detail: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        )
      );
      return;
    }

    const chunks: Buffer[] = [];
    let stderr = "";

    child.stdout.on("data", (d: Buffer) => chunks.push(d));
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

    child.on("error", (err) => {
      resolve(
        NextResponse.json(
          {
            error: `Piper process error. Is "${PIPER_BIN}" installed?`,
            detail: err.message,
          },
          { status: 500 }
        )
      );
    });

    child.on("close", (code) => {
      if (code !== 0 || chunks.length === 0) {
        resolve(
          NextResponse.json(
            { error: `Piper exited with code ${code}`, detail: stderr.trim() },
            { status: 500 }
          )
        );
        return;
      }
      const wav = Buffer.concat(chunks);
      resolve(
        new NextResponse(wav, {
          headers: {
            "Content-Type": "audio/wav",
            "Content-Length": String(wav.length),
          },
        })
      );
    });

    // Piper reads one line of text from stdin.
    child.stdin.write(text.replace(/\n+/g, " "));
    child.stdin.end();
  });
}
