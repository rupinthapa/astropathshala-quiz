import ScoreboardClient from "./ScoreboardClient";
import { prisma } from "@/lib/prisma";

export default async function ScoreboardPage() {
  const teams = await prisma.team.findMany({
    orderBy: { score: "desc" },
  });

  return <ScoreboardClient initialTeams={teams} />;
}
