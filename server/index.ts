import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from '@hono/node-server';

const app = new Hono();

// Enhanced CORS configuration
app.use('*', cors({
  origin: ['http://localhost:3000'],
  allowHeaders: ['Content-Type'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  maxAge: 600,
  credentials: true,
}));

// In-memory store for round state
const roundStates = new Map<string, {
  currentQuestionId?: number;
  isAnswerRevealed: boolean;
  isTimerRunning: boolean;
  timeLeft: number;
}>();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// ----------- SHOW QUESTION -----------
app.post("/show-question", async (c) => {
  try {
    const { roundId, questionId } = await c.req.json();
    
    if (!roundId || !questionId) {
      return c.json({ success: false, error: 'Missing roundId or questionId' }, 400);
    }

    // Update round state
    roundStates.set(`round-${roundId}`, {
      currentQuestionId: questionId,
      isAnswerRevealed: false,
      isTimerRunning: false,
      timeLeft: 30 // Default time limit
    });

    return c.json({ 
      success: true, 
      data: { 
        questionId,
        message: 'Question shown successfully' 
      } 
    });
  } catch (error) {
    console.error('Error in show-question:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ----------- REVEAL ANSWER ----------
app.post("/reveal-answer", async (c) => {
  try {
    const { roundId, questionId } = await c.req.json();
    
    if (!roundId || !questionId) {
      return c.json({ success: false, error: 'Missing roundId or questionId' }, 400);
    }

    const roundKey = `round-${roundId}`;
    const roundState = roundStates.get(roundKey) || {
      currentQuestionId: questionId,
      isAnswerRevealed: false,
      isTimerRunning: false,
      timeLeft: 30
    };

    // Update round state
    roundState.isAnswerRevealed = true;
    roundStates.set(roundKey, roundState);

    return c.json({ 
      success: true, 
      data: { 
        questionId,
        isAnswerRevealed: true,
        message: 'Answer revealed successfully' 
      } 
    });
  } catch (error) {
    console.error('Error in reveal-answer:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ----------- START TIMER -------------
app.post("/start-timer", async (c) => {
  try {
    const { roundId, duration } = await c.req.json();
    
    if (!roundId) {
      return c.json({ success: false, error: 'Missing roundId' }, 400);
    }

    const roundKey = `round-${roundId}`;
    const roundState = roundStates.get(roundKey) || {
      currentQuestionId: undefined,
      isAnswerRevealed: false,
      isTimerRunning: false,
      timeLeft: duration || 30
    };

    // Update round state
    roundState.isTimerRunning = true;
    roundState.timeLeft = duration || roundState.timeLeft || 30;
    roundStates.set(roundKey, roundState);

    return c.json({ 
      success: true, 
      data: { 
        duration: roundState.timeLeft,
        isTimerRunning: true,
        message: 'Timer started successfully' 
      } 
    });
  } catch (error) {
    console.error('Error in start-timer:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ----------- GET ROUND STATE -------------
app.get('/round/:roundId/state', async (c) => {
  try {
    const roundId = c.req.param('roundId');
    const roundState = roundStates.get(`round-${roundId}`);
    
    if (!roundState) {
      return c.json({ 
        success: true, 
        data: { 
          currentQuestionId: null,
          isAnswerRevealed: false,
          isTimerRunning: false,
          timeLeft: 30
        } 
      });
    }

    return c.json({ 
      success: true, 
      data: roundState 
    });
  } catch (error) {
    console.error('Error getting round state:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Start the server
const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});