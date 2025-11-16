import { prisma } from "@/lib/prisma";

export default async function EventQuestionsPage(
  props: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await props.params;
  const eventIdNum = Number(eventId);

  const event = await prisma.quizEvent.findUnique({
    where: { id: eventIdNum },
    include: { school: true, rounds: true },
  });

  if (!event) return <div>Event not found.</div>;

  return (
    <div>
      <h2>Manage Questions</h2>

      <p>
        <strong>Event:</strong> {event.name} <br />
        <strong>School:</strong> {event.school.name} <br />
        <strong>Level:</strong> {event.level}
      </p>

      <h3>Rounds</h3>

      <ul>
        {event.rounds
          .sort((a, b) => a.order - b.order)
          .map((r) => (
            <li key={r.id}>
              <a href={`/admin/events/${eventIdNum}/rounds/${r.id}/questions`}>
                {r.order}. {r.name}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}
