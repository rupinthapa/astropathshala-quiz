// src/app/api/events/[eventId]/state/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: return current live state (plus question data)
export async function GET(
  _req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const eId = Number(eventId);

  const state = await prisma.eventState.findUnique({
    where: { eventId: eId },
    include: {
      event: {
        include: {
          school: true,
          teams: true,
          rounds: true,
        },
      },
    },
  });

  if (!state) {
    return NextResponse.json({ state: null }, { status: 200 });
  }

  // Optionally include current question details
  const question = state.currentQuestionId
    ? await prisma.question.findUnique({
        where: { id: state.currentQuestionId },
      })
    : null;

  return NextResponse.json({ state, question }, { status: 200 });
}

// POST: update state (host actions)
export async function POST(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
  const eId = Number(eventId);
  const body = await req.json();

  // body could contain: currentRoundId, currentQuestionId, isAnswerRevealed, isFiftyUsed, timerDeadline
  const state = await prisma.eventState.upsert({
    where: { eventId: eId },
    create: {
      eventId: eId,
      currentRoundId: body.currentRoundId ?? null,
      currentQuestionId: body.currentQuestionId ?? null,
      isAnswerRevealed: body.isAnswerRevealed ?? false,
      isFiftyUsed: body.isFiftyUsed ?? false,
      timerDeadline: body.timerDeadline ?? null,
    },
    update: {
      currentRoundId: body.currentRoundId ?? undefined,
      currentQuestionId: body.currentQuestionId ?? undefined,
      isAnswerRevealed: body.isAnswerRevealed ?? undefined,
      isFiftyUsed: body.isFiftyUsed ?? undefined,
      timerDeadline: body.timerDeadline ?? undefined,
    },
  });

  return NextResponse.json({ state }, { status: 200 });
}
