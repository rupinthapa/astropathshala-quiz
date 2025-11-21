import AdminLayout from "../AdminLayout";
import { prisma } from "@/lib/prisma";

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <AdminLayout>
      <h2 className="quiz-title-secondary">Add New School</h2>

      {/* CREATE SCHOOL FORM */}
      <form action="/admin/schools/create" method="post" className="quiz-form">

        <label className="quiz-label">School Name</label>
        <input
          name="name"
          className="quiz-input"
          placeholder="e.g. St. Joseph’s School"
          required
        />

        <label className="quiz-label">City</label>
        <input
          name="city"
          className="quiz-input"
          placeholder="e.g. Nainital"
          required
        />

        <button type="submit" className="quiz-btn quiz-btn-primary" style={{ marginTop: 20 }}>
          Add School
        </button>
      </form>

      {/* SCHOOL LIST */}
      <h2 className="quiz-title-secondary" style={{ marginTop: 40 }}>
        All Schools
      </h2>

      <ul className="quiz-list">
        {schools.map((s) => (
          <li key={s.id} className="quiz-list-item">
            <span>
              <strong>{s.name}</strong> — {s.city}
            </span>

            <a
              href={`/admin/schools/${s.id}`}
              className="quiz-btn quiz-btn-small"
            >
              Manage
            </a>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
