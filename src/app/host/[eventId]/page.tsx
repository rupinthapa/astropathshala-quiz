import { prisma } from "@/lib/prisma";

export default async function HostEventPage(
  props: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await props.params;
  const eId = Number(eventId);

  const event = await prisma.quizEvent.findUnique({
    where: { id: eId },
    include: {
      school: true,
      rounds: true,
      teams: true,
      roundScores: true,
    },
  });

  if (!event) return <div>Event not found</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Quizmaster Panel</h1>

      <h2>
        {event.name} — {event.school.name}
      </h2>

      <h3>Teams</h3>
      <ul>
        {event.teams.map((t) => (
          <li key={t.id}>
            {t.name} — {t.score} pts
          </li>
        ))}
      </ul>

      <h3>Rounds</h3>
      <ul>
        {event.rounds
          .sort((a, b) => a.order - b.order)
          .map((r) => (
            <li key={r.id} style={{ marginTop: "10px" }}>
              <strong>
                {r.order}. {r.name}
              </strong>{" "}
              <a
                href={`/host/${eventId}/round/${r.id}`}
                style={{ marginLeft: "20px", textDecoration: "underline" }}
              >
                Start Round
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}
