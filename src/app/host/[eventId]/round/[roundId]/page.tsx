import { prisma } from "@/lib/prisma";

export default async function HostRoundPage(
  props: { params: Promise<{ eventId: string; roundId: string }> }
) {
  const { eventId, roundId } = await props.params;
  const eId = Number(eventId);
  const rId = Number(roundId);

  const round = await prisma.round.findUnique({
    where: { id: rId },
    include: { questions: true, quizEvent: true },
  });

  if (!round) return <div>Round not found</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Round {round.order}: {round.name}</h1>

      <h2>Questions</h2>
      <ul>
        {round.questions
          .sort((a, b) => a.orderInRound - b.orderInRound)
          .map((q) => (
            <li key={q.id} style={{ marginTop: "10px" }}>
              Q{q.orderInRound}: {q.text}
              <a
                href={`/host/${eventId}/round/${roundId}/question/${q.id}`}
                style={{ marginLeft: "20px", textDecoration: "underline" }}
              >
                Open
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}
