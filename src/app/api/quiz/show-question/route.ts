import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  const body = await req.json();
  const { roundId, questionId } = body;

  await pusherServer.trigger(`round-${roundId}`, "show-question", {
    questionId,
  });

  return NextResponse.json({ success: true });
}
