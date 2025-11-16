import { prisma } from "@/lib/prisma";

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { id: "asc" }
  });

  return (
    <div>
      <h2>Schools</h2>

      <form action="/admin/schools/create" method="post" style={{ marginBottom: "20px" }}>
        <input name="name" placeholder="School Name" required />
        <input name="city" placeholder="City (optional)" />
        <button type="submit">Add School</button>
      </form>

      <h3>Existing Schools</h3>
      <ul>
        {schools.map(s => (
          <li key={s.id}>
            {s.name} {s.city ? `(${s.city})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
