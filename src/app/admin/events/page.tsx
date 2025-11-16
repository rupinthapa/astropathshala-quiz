import { prisma } from "@/lib/prisma";

export default async function EventsPage() {
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" }});
  const events = await prisma.quizEvent.findMany({
    include: { school: true },
    orderBy: { id: "desc" }
  });

  return (
    <div>
      <h2>Create Quiz Event</h2>

      <form action="/admin/events/create" method="post" style={{ marginBottom: "30px" }}>
        <select name="schoolId" required>
          <option value="">Select School</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select name="level" required>
          <option value="">Select Level</option>
          <option value="JUNIOR">Junior</option>
          <option value="SENIOR">Senior</option>
        </select>

        <input type="date" name="date" required />

        <input name="eventName" placeholder="Event Name (optional)" />

        <button type="submit">Create Event</button>
      </form>

      <h3>Existing Events</h3>

      <ul>
  {events.map(e => (
    <li key={e.id} style={{ marginTop: "10px" }}>
      <strong>{e.name}</strong> — {e.school.name} ({e.level})  
      — {e.date.toDateString()}{" "}
      
      <a 
        href={`/admin/events/${e.id}/questions`}
        style={{ marginLeft: "20px", textDecoration: "underline" }}
      >
        Manage Questions
      </a>
    </li>
  ))}
</ul>

    </div>
  );
}
