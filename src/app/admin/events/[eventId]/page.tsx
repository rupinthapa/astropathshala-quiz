import AdminLayout from "../../AdminLayout";
import { prisma } from "@/lib/prisma";

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const eventId = Number(params.eventId);

  const event = await prisma.quizEvent.findUnique({
    where: { id: eventId },
    include: {
      school: true,
      rounds: { orderBy: { order: "asc" } },
      teams: true,
    },
  });

  if (!event) return <AdminLayout><div>Event not found</div></AdminLayout>;

  return (
    <AdminLayout>
      {/* EVENT HEADER */}
      <h1 className="quiz-title">Event: {event.name}</h1>
      <h3 className="quiz-title-secondary">{event.school.name}</h3>

      {/* QUICK LINKS */}
      <div className="quiz-card" style={{ marginTop: 20 }}>
        <h3>Quick Links</h3>

        <div style={{ marginTop: 10 }}>
          <a href={`/host/${eventId}`} className="quiz-btn quiz-btn-primary" style={{ marginRight: 10 }}>
            Launch Host Panel
          </a>
          <a href={`/screen/${eventId}/1`} className="quiz-btn quiz-btn-secondary">
            Open Projector Screen
          </a>
        </div>
      </div>

      {/* ROUNDS */}
      <div className="quiz-card" style={{ marginTop: 30 }}>
        <h2 className="quiz-title-secondary">Rounds</h2>

        <a
          href={`/admin/events/${eventId}/rounds/create`}
          className="quiz-btn quiz-btn-primary"
          style={{ marginBottom: 15 }}
        >
          + Add Round
        </a>

        <ul className="quiz-list">
          {event.rounds.map((round) => (
            <li key={round.id} className="quiz-list-item">
              <span>
                <strong>{round.order}. {round.name}</strong> — {round.type}
              </span>
              <a
                href={`/admin/events/${eventId}/rounds/${round.id}`}
                className="quiz-btn quiz-btn-small"
              >
                Manage
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* TEAMS */}
      <div className="quiz-card" style={{ marginTop: 30 }}>
        <h2 className="quiz-title-secondary">Teams</h2>

        <a
          href={`/admin/events/${eventId}/teams/create`}
          className="quiz-btn quiz-btn-primary"
          style={{ marginBottom: 15 }}
        >
          + Add Team
        </a>

        <ul className="quiz-list">
          {event.teams.map((team) => (
            <li key={team.id} className="quiz-list-item">
              <span>{team.name}</span>
              <a
                href={`/admin/events/${eventId}/teams/${team.id}`}
                className="quiz-btn quiz-btn-small"
              >
                Manage
              </a>
            </li>
          ))}
        </ul>
      </div>

    </AdminLayout>
  );
}
