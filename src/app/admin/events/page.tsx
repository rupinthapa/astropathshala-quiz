import AdminLayout from "../AdminLayout";
import { prisma } from "@/lib/prisma";

export default async function EventsPage() {
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
  const events = await prisma.quizEvent.findMany({
    include: { school: true },
    orderBy: { id: "desc" },
  });

  return (
    <AdminLayout>
      <h2 className="quiz-title-secondary">Create Quiz Event</h2>

      {/* CREATE EVENT FORM */}
      <form action="/admin/events/create" method="post" className="quiz-form">

        <label className="quiz-label">Select School</label>
        <select name="schoolId" className="quiz-input" required>
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <label className="quiz-label">Select Level</label>
        <select name="level" className="quiz-input" required>
          <option value="">Select Level</option>
          <option value="JUNIOR">Junior</option>
          <option value="SENIOR">Senior</option>
        </select>

        <label className="quiz-label">Event Name</label>
        <input name="name" className="quiz-input" placeholder="Quiz Name" required />

        <button type="submit" className="quiz-btn quiz-btn-primary" style={{ marginTop: 20 }}>
          Create Event
        </button>
      </form>

      {/* EVENTS LIST */}
      <h2 className="quiz-title-secondary" style={{ marginTop: 40 }}>All Quiz Events</h2>
      <ul className="quiz-list">
        {events.map((e) => (
          <li key={e.id} className="quiz-list-item">
            <span>{e.name} — {e.school?.name}</span>
            <a href={`/admin/events/${e.id}`} className="quiz-btn quiz-btn-small">
              Manage
            </a>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
