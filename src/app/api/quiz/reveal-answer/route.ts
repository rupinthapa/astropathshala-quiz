import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  const body = await req.json();
  const { roundId } = body;

  await pusherServer.trigger(`round-${roundId}`, "reveal-answer", {
    reveal: true,
  });

  return NextResponse.json({ success: true });
}
