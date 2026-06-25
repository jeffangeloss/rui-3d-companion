import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Lip-sync viseme track endpoint — placeholder for the Rhubarb upgrade (step 8).
 *
 * MVP lip sync is done entirely on the client from live audio volume
 * (see src/lib/lipsync.ts -> VolumeLipSync), so this route is not required yet.
 *
 * The contract is defined now so the client can switch over without changes:
 * POST audio, receive `{ cues: [{ start, value }] }` (Rhubarb mouth shapes).
 *
 * To implement later: accept the audio blob, run Rhubarb
 *   rhubarb -f json -o out.json recording.wav
 * and return the parsed mouthCues.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      cues: [],
      note:
        "Rhubarb lip-sync is not enabled yet. The client uses volume-based lip sync (VolumeLipSync). " +
        "Wire Rhubarb here to return precise viseme cues.",
    },
    { status: 200 }
  );
}
