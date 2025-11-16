import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(request: Request, { params }: any) {
  const { eventId, roundId } = params;

  const form = await request.formData();

  const text = form.get("text") as string;
  const optionA = form.get("optionA") as string;
  const optionB = form.get("optionB") as string;
  const optionC = form.get("optionC") as string;
  const optionD = form.get("optionD") as string;
  const correctOption = form.get("correctOption") as any;
  const points = Number(form.get("points"));
  const timeLimitSec = Number(form.get("timeLimitSec"));
  const orderInRound = Number(form.get("orderInRound"));

  await prisma.question.create({
    data: {
      text,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      points,
      timeLimitSec,
      orderInRound,
      type: "MCQ",
      roundId: Number(roundId),
    },
  });

  redirect(`/admin/events/${eventId}/rounds/${roundId}/questions`);
}
