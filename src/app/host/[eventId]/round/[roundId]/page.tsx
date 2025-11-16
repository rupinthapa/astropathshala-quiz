import { prisma } from "@/lib/prisma";

export default async function HostRoundPage({
  params,
}: {
  params: { eventId: string; roundId: string };
}) {
  const eventId = Number(params.eventId);
  const roundId = Number(params.roundId);

  if (isNaN(eventId) || isNaN(roundId)) {
    return <div>Invalid IDs</div>;
  }

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      quizEvent: true,
      questions: true,
    },
  });

  if (!round) return <div>Round not found</div>;

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>
        Round {round.order}: {round.name}
      </h1>

      <h2>Questions</h2>

      <ul>
        {round.questions.map((q) => (
          <li key={q.id}>
            {q.orderInRound}. {q.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
