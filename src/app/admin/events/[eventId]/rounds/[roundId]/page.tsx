import AdminLayout from "@/app/admin/AdminLayout";
import { prisma } from "@/lib/prisma";

export default async function RoundDetailPage({
  params,
}: {
  params: { eventId: string; roundId: string };
}) {
  const eventId = Number(params.eventId);
  const roundId = Number(params.roundId);

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      questions: { orderBy: { orderInRound: "asc" } },
    },
  });

  if (!round)
    return (
      <AdminLayout>
        <div>Round not found</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h1 className="quiz-title">Manage Round: {round.name}</h1>

      {/* ROUND INFO */}
      <div className="quiz-card">
        <h3>Round Details</h3>

        <form
          method="POST"
          action={`/api/admin/round/update`}
          style={{ marginTop: 15 }}
        >
          <input type="hidden" name="roundId" value={roundId} />

          <label className="quiz-label">Round Name</label>
          <input
            type="text"
            name="name"
            defaultValue={round.name}
            className="quiz-input"
          />

          <label className="quiz-label">Round Type</label>
          <select
            name="type"
            defaultValue={round.type}
            className="quiz-input"
          >
            <option value="MCQ">MCQ</option>
            <option value="BUZZER">Buzzer</option>
            <option value="RAPID">Rapid Fire</option>
            <option value="VISUAL">Visual Round</option>
          </select>

          <label className="quiz-label">Order</label>
          <input
            type="number"
            name="order"
            defaultValue={round.order}
            className="quiz-input"
          />

          <button
            className="quiz-btn quiz-btn-primary"
            style={{ marginTop: 10 }}
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* QUESTIONS LIST */}
      <div className="quiz-card" style={{ marginTop: 30 }}>
        <h3>Questions in this Round</h3>

        <a
          href={`/admin/events/${eventId}/rounds/${roundId}/questions/create`}
          className="quiz-btn quiz-btn-primary"
          style={{ marginBottom: 15 }}
        >
          + Add Question
        </a>

        <ul className="quiz-list">
          {round.questions.map((q) => (
            <li key={q.id} className="quiz-list-item">
              <span>
                <strong>Q{q.orderInRound}</strong> — {q.text}
              </span>

              <a
                href={`/admin/events/${eventId}/rounds/${roundId}/questions/${q.id}`}
                className="quiz-btn quiz-btn-small"
              >
                Edit
              </a>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
