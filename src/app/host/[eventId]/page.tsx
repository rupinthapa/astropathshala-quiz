import { prisma } from "@/lib/prisma";

export default async function HostEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const eventId = Number(params.eventId);

  if (!eventId || isNaN(eventId)) {
    return <div>Invalid Event ID</div>;
  }

  const event = await prisma.quizEvent.findUnique({
    where: { id: eventId },
    include: {
      school: true,
      rounds: true,
      teams: true,
      roundScores: true,
    },
  });

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Quizmaster Panel</h1>

      <h2>
        {event.name} — {event.school.name}
      </h2>

      <h3>Teams</h3>
      <ul>
        {event.teams.map((team) => (
          <li key={team.id}>
            {team.name} — {team.score} pts
          </li>
        ))}
      </ul>

      <h3>Rounds</h3>
      <ul>
        {event.rounds
          .sort((a, b) => a.order - b.order)
          .map((round) => (
            <li key={round.id}>
              <strong>
                {round.order}. {round.name}
              </strong>{" "}
              <a href={`/host/${eventId}/round/${round.id}`}>
                Start Round →
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}
