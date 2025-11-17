// src/app/host/[eventId]/round/[roundId]/page.tsx
import { prisma } from "@/lib/prisma";
import RoundHostClient from "./RoundHostClient";

type PageProps = {
  params: {
    eventId: string;
    roundId: string;
  };
};

export default async function HostRoundPage({ params }: PageProps) {
  const eventId = Number(params.eventId);
  const roundId = Number(params.roundId);

  if (!eventId || isNaN(eventId) || !roundId || isNaN(roundId)) {
    return <div>Invalid URL</div>;
  }

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      quizEvent: {
        include: {
          school: true,
        },
      },
      questions: {
        orderBy: { orderInRound: "asc" },
      },
    },
  });

  if (!round) {
    return <div>Round not found</div>;
  }

  if (!round.quizEvent) {
    return <div>This round is not linked to a quiz event.</div>;
  }

  return (
    <RoundHostClient
      eventId={eventId}
      roundId={roundId}
      eventName={round.quizEvent.name}
      schoolName={round.quizEvent.school?.name ?? ""}
      roundName={round.name}
      questions={round.questions}
    />
  );
}
