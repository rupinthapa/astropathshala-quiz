import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  const form = await req.formData();
  const teamId = Number(form.get("teamId"));
  const points = Number(form.get("points"));
  const eventId = Number(form.get("eventId"));

  if (!teamId || isNaN(points)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const team = await prisma.team.update({
    where: { id: teamId },
    data: { score: { increment: points } },
  });

  // push live update
  await pusherServer.trigger(
    `event-${eventId}-scores`,
    "score-update",
    { teamId, score: team.score }
  );

  return NextResponse.json({ success: true, team });
}
