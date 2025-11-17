import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  const body = await req.json();
  const { roundId, duration } = body;

  await pusherServer.trigger(`round-${roundId}`, "start-timer", {
    duration,
  });

  return NextResponse.json({ success: true });
}
