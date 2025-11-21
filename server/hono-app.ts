import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import Pusher from "pusher";

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Pusher
const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
  useTLS: true,
});

const app = new Hono();

// Show Question
app.post("/show-question", async (c) => {
  const { roundId, questionId } = await c.req.json();

  await pusherServer.trigger(`round-${roundId}`, "show-question", {
    questionId,
  });

  return c.json({ ok: true });
});

// Reveal Answer
app.post("/reveal-answer", async (c) => {
  const { roundId } = await c.req.json();

  await pusherServer.trigger(`round-${roundId}`, "reveal-answer", {});

  return c.json({ ok: true });
});

// Start Timer
app.post("/start-timer", async (c) => {
  const { roundId, duration } = await c.req.json();

  await pusherServer.trigger(`round-${roundId}`, "start-timer", {
    duration,
  });

  return c.json({ ok: true });
});

// UPDATE SCORE (future feature)
app.post("/update-score", async (c) => {
  const { teamId, delta } = await c.req.json();

  await prisma.team.update({
    where: { id: teamId },
    data: { score: { increment: delta } },
  });

  return c.json({ ok: true });
});

export default app;
