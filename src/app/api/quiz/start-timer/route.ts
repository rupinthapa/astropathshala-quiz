import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  const data = await req.json();

  await pusherServer.trigger(`round-${data.roundId}`, "start-timer", {
    duration: data.duration,
  });

  return NextResponse.json({ status: "ok" });
}
