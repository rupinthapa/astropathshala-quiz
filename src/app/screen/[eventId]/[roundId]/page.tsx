import { prisma } from "@/lib/prisma";
import ScreenClient from "./ScreenClient";

export default async function ScreenPage({ params }: any) {
  const eventId = Number(params.eventId);
  const roundId = Number(params.roundId);

  // Load questions (host will control selection later)
  const questions = await prisma.question.findMany({
    where: { roundId },
    orderBy: { orderInRound: "asc" },
  });

  return (
    <ScreenClient
      initialQuestion={null}
      channelName={`event-${eventId}-round-${roundId}`}
    />
  );
}
