import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

const app = new Hono();

// CORS for Next.js (3001)
app.use(
  "*",
  cors({
    origin: ["http://localhost:3001"],
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 600,
    credentials: true,
  })
);

// In-memory round state
type RoundState = {
  currentQuestionId: number | null;
  isAnswerRevealed: boolean;
  isTimerRunning: boolean;
  timeLeft: number; // just the initial duration; countdown happens on clients
};

const roundStates = new Map<string, RoundState>();

const getRoundKey = (roundId: string | number) => `round-${roundId}`;

// ------------ HEALTH ------------
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: "development",
  });
});

// ------------ SHOW QUESTION ------------
app.post("/show-question", async (c) => {
  try {
    const body = await c.req.json();
    const { roundId, questionId } = body as {
      roundId?: number | string;
      questionId?: number;
    };

    if (!roundId || !questionId) {
      return c.json(
        { success: false, error: "Missing roundId or questionId" },
        400
      );
    }

    const key = getRoundKey(roundId);

    const prev = roundStates.get(key);
    const next: RoundState = {
      currentQuestionId: questionId,
      isAnswerRevealed: false,
      isTimerRunning: prev?.isTimerRunning ?? false,
      timeLeft: prev?.timeLeft ?? 30,
    };

    roundStates.set(key, next);

    return c.json({
      success: true,
      data: next,
    });
  } catch (err) {
    console.error("show-question error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ------------ REVEAL ANSWER ------------
app.post("/reveal-answer", async (c) => {
  try {
    const body = await c.req.json();
    const { roundId, questionId } = body as {
      roundId?: number | string;
      questionId?: number;
    };

    if (!roundId || !questionId) {
      return c.json(
        { success: false, error: "Missing roundId or questionId" },
        400
      );
    }

    const key = getRoundKey(roundId);
    const prev = roundStates.get(key);

    const next: RoundState = {
      currentQuestionId: prev?.currentQuestionId ?? questionId,
      isAnswerRevealed: true,
      isTimerRunning: prev?.isTimerRunning ?? false,
      timeLeft: prev?.timeLeft ?? 30,
    };

    roundStates.set(key, next);

    return c.json({ success: true, data: next });
  } catch (err) {
    console.error("reveal-answer error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ------------ START TIMER ------------
app.post("/start-timer", async (c) => {
  try {
    const body = await c.req.json();
    const { roundId, duration } = body as {
      roundId?: number | string;
      duration?: number;
    };

    if (!roundId) {
      return c.json({ success: false, error: "Missing roundId" }, 400);
    }

    const key = getRoundKey(roundId);
    const prev = roundStates.get(key);

    const seconds = duration && duration > 0 ? duration : prev?.timeLeft ?? 30;

    const next: RoundState = {
      currentQuestionId: prev?.currentQuestionId ?? null,
      isAnswerRevealed: prev?.isAnswerRevealed ?? false,
      isTimerRunning: true,
      timeLeft: seconds,
    };

    roundStates.set(key, next);

    return c.json({ success: true, data: next });
  } catch (err) {
    console.error("start-timer error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ------------ GET ROUND STATE ------------
app.get("/round/:roundId/state", (c) => {
  try {
    const roundId = c.req.param("roundId");
    const key = getRoundKey(roundId);
    const state = roundStates.get(key);

    if (!state) {
      // default blank state
      return c.json({
        success: true,
        data: {
          currentQuestionId: null,
          isAnswerRevealed: false,
          isTimerRunning: false,
          timeLeft: 30,
        } satisfies RoundState,
      });
    }

    return c.json({ success: true, data: state });
  } catch (err) {
    console.error("get round state error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ------------ START SERVER ------------
const port = 3000;
console.log(`Hono server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
