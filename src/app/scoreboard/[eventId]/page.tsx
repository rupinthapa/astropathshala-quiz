import ScoreboardClient from "./ScoreboardClient";
import { prisma } from "@/lib/prisma";

export default async function ScoreboardPage({ params }: any) {
  const eventId = Number(params.eventId);

  const teams = await prisma.team.findMany({
    where: { eventId },
    orderBy: { score: "desc" }
  });

  return <ScoreboardClient eventId={eventId} initialTeams={teams} />;
}
