import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const form = await request.formData();

  const schoolId = Number(form.get("schoolId"));
  const level = form.get("level") as "JUNIOR" | "SENIOR";
  const date = new Date(form.get("date") as string);

  let eventName = (form.get("eventName") as string) || "";
  if (!eventName) {
    eventName = `Antariksha Vigyaan Spardha - ${level}`;
  }

  // 1. Create the quiz event
  const quizEvent = await prisma.quizEvent.create({
    data: {
      name: eventName,
      level,
      date,
      schoolId
    }
  });

  // 2. Create the 4 default rounds
  const rounds = [
    { name: "Time Teller", order: 1, type: "TIME_TELLER" },
    { name: "Puzzle Round", order: 2, type: "PUZZLE" },
    { name: "Rapid Fire", order: 3, type: "RAPID_FIRE" },
    { name: "Buzzer Round", order: 4, type: "BUZZER" }
  ];

  for (const r of rounds) {
    await prisma.round.create({
      data: {
        name: r.name,
        order: r.order,
        type: r.type as any,
        quizEventId: quizEvent.id
      }
    });
  }

  redirect("/admin/events");
}
