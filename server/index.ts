import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

const app = new Hono();

// CORS for Next.js (3001)
app.use(
  "*",
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
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
  timeLeft: number;
  timerStartTime?: number; // timestamp when timer started
  hiddenOptions?: string[]; // for 50:50
};

const roundStates = new Map<string, RoundState>();

const getRoundKey = (roundId: string | number) => `round-${roundId}`;

// Helper to get current time left (accounting for elapsed time)
const getActualTimeLeft = (state: RoundState): number => {
  if (!state.isTimerRunning || !state.timerStartTime) {
    return state.timeLeft;
  }
  
  const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
  const remaining = Math.max(0, state.timeLeft - elapsed);
  
  // Auto-stop timer if time is up
  if (remaining === 0) {
    state.isTimerRunning = false;
  }
  
  return remaining;
};

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
      isTimerRunning: false,
      timeLeft: prev?.timeLeft ?? 30,
      hiddenOptions: [], // Reset 50:50 for new question
    };

    roundStates.set(key, next);

    console.log(`[SHOW QUESTION] Round ${roundId}, Question ${questionId}`);

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

    if (!prev) {
      return c.json(
        { success: false, error: "No active question" },
        400
      );
    }

    const next: RoundState = {
      ...prev,
      isAnswerRevealed: true,
      isTimerRunning: false, // Stop timer when revealing
      timeLeft: prev.timeLeft,
    };

    roundStates.set(key, next);

    console.log(`[REVEAL ANSWER] Round ${roundId}, Question ${questionId}`);

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

    const seconds = duration && duration > 0 ? duration : 30;

    const next: RoundState = {
      currentQuestionId: prev?.currentQuestionId ?? null,
      isAnswerRevealed: prev?.isAnswerRevealed ?? false,
      isTimerRunning: true,
      timeLeft: seconds,
      timerStartTime: Date.now(),
      hiddenOptions: prev?.hiddenOptions ?? [],
    };

    roundStates.set(key, next);

    console.log(`[START TIMER] Round ${roundId}, Duration ${seconds}s`);

    return c.json({ success: true, data: next });
  } catch (err) {
    console.error("start-timer error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ------------ USE 50:50 ------------
app.post("/use-5050", async (c) => {
  try {
    const body = await c.req.json();
    const { roundId, questionId, hiddenOptions } = body as {
      roundId?: number | string;
      questionId?: number;
      hiddenOptions?: string[];
    };

    if (!roundId || !questionId || !hiddenOptions) {
      return c.json(
        { success: false, error: "Missing roundId, questionId, or hiddenOptions" },
        400
      );
    }

    const key = getRoundKey(roundId);
    const prev = roundStates.get(key);

    if (!prev) {
      return c.json(
        { success: false, error: "No active question" },
        400
      );
    }

    const next: RoundState = {
      ...prev,
      hiddenOptions,
    };

    roundStates.set(key, next);

    console.log(`[50:50] Round ${roundId}, Hidden: ${hiddenOptions.join(', ')}`);

    return c.json({ success: true, data: next });
  } catch (err) {
    console.error("use-5050 error:", err);
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
          hiddenOptions: [],
        } satisfies RoundState,
      });
    }

    // Return state with calculated time left
    const actualTimeLeft = getActualTimeLeft(state);
    
    const responseState: RoundState = {
      ...state,
      timeLeft: actualTimeLeft,
    };

    return c.json({ success: true, data: responseState });
  } catch (err) {
    console.error("get round state error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ------------ DEBUG: List all states ------------
app.get("/debug/states", (c) => {
  const states: Record<string, any> = {};
  roundStates.forEach((value, key) => {
    states[key] = {
      ...value,
      actualTimeLeft: getActualTimeLeft(value),
    };
  });
  return c.json({ states });
});

// ------------ START SERVER ------------
const port = 3001;
console.log(`🚀 Hono server running at http://localhost:${port}`);
console.log(`📡 Ready to receive quiz commands...`);

serve({
  fetch: app.fetch,
  port,
});