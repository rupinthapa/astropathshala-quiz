import { prisma } from "@/lib/prisma";
import ScreenClient from "./ScreenClient";

interface PageProps {
  params: {
    eventId: string;
    roundId: string;
  };
}

export default async function ScreenPage({ params }: PageProps) {
  const { eventId, roundId } = params;
  const numericEventId = Number(eventId);
  const numericRoundId = Number(roundId);

  // Fetch the round along with its related event and school data
  const round = await prisma.round.findUnique({
    where: { id: numericRoundId },
    include: {
      quizEvent: {
        include: {
          school: true,
        },
      },
    },
  });

  const questions = await prisma.question.findMany({
    where: { roundId: numericRoundId },
    orderBy: { orderInRound: "asc" },
  });

  if (!round || !round.quizEvent) {
    return <div>Round or associated event not found</div>;
  }

  return (
    <ScreenClient
      eventId={numericEventId}
      roundId={numericRoundId}
      eventName={round.quizEvent.name}
      schoolName={round.quizEvent.school?.name ?? "Unknown School"}
      roundName={round.name}
      questions={questions}
    />
  );
}