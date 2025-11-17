import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  const data = await req.json();

  await pusherServer.trigger(`round-${data.roundId}`, "show-question", {
    questionId: data.questionId,
  });

  return NextResponse.json({ status: "ok" });
}
