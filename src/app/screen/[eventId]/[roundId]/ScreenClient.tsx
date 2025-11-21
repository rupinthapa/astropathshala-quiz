"use client";

import { useEffect, useMemo, useState } from "react";
import "@/styles/quiz-ui.css";

const API_BASE = "http://localhost:3000";

type Question = {
  id: number;
  text: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  timeLimitSec: number;
  points: number;
  orderInRound: number;
};

type Props = {
  eventId: number;
  roundId: number;
  eventName: string;
  schoolName: string;
  roundName: string;
  questions: Question[];
};

type RoundState = {
  currentQuestionId: number | null;
  isAnswerRevealed: boolean;
  isTimerRunning: boolean;
  timeLeft: number;
};

export default function ScreenClient({
  eventId,
  roundId,
  eventName,
  schoolName,
  roundName,
  questions,
}: Props) {
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(
    null
  );
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [globalState, setGlobalState] = useState<RoundState | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // -------------------------
  // POLLING HONO SERVER STATE
  // -------------------------
  useEffect(() => {
    let mounted = true;

    const fetchState = async () => {
      try {
        const res = await fetch(`${API_BASE}/round/${roundId}/state`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const json = await res.json();
        if (!mounted || !json.success) return;

        const state = json.data as RoundState;

        setGlobalState(state);
        setCurrentQuestionId(state.currentQuestionId);
        setAnswerRevealed(state.isAnswerRevealed);

        // if starting new timer
        if (state.isTimerRunning && !timerRunning) {
          setTimerRunning(true);
          setTimeLeft(state.timeLeft);
        }

        // if timer stopped
        if (!state.isTimerRunning) {
          setTimerRunning(false);
        }
      } catch (err) {
        console.error("Error polling state:", err);
      }
    };

    fetchState();
    const id = setInterval(fetchState, 1000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [roundId, timerRunning]);

  // -------------------------
  // LOCAL COUNTDOWN
  // -------------------------
  useEffect(() => {
    if (!timerRunning) return;
    if (timeLeft <= 0) {
      setTimerRunning(false);
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, timeLeft]);

  // -------------------------
  // FIND CURRENT QUESTION
  // -------------------------
  const currentQuestion = useMemo(() => {
    if (!currentQuestionId) return null;
    return questions.find((q) => q.id === currentQuestionId) ?? null;
  }, [questions, currentQuestionId]);

  // -------------------------
  // RENDER (NO QUESTION)
  // -------------------------
  if (!currentQuestion) {
    return (
      <div className="quiz-screen">
        <h1>No question selected yet…</h1>
      </div>
    );
  }

  const options = [
    { key: "A", label: "A", value: currentQuestion.optionA },
    { key: "B", label: "B", value: currentQuestion.optionB },
    { key: "C", label: "C", value: currentQuestion.optionC },
    { key: "D", label: "D", value: currentQuestion.optionD },
  ].filter((o) => o.value !== null);

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="quiz-screen">
      <header className="quiz-screen-header">
        <div>
          <h2>{eventName}</h2>
          <p>
            {schoolName} — {roundName}
          </p>
        </div>

        {timerRunning && (
          <div className="quiz-screen-timer">
            ⏳ {timeLeft}s
          </div>
        )}
      </header>

      <main className="quiz-screen-main">
        <div className="quiz-screen-question">
          <h1>{currentQuestion.text}</h1>
        </div>

        <div className="quiz-screen-options">
          {options.map((opt) => {
            const isCorrect =
              answerRevealed &&
              currentQuestion.correctOption === opt.key;

            const classes = [
              "quiz-screen-option",
              isCorrect && "quiz-screen-option-correct",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={opt.key} className={classes}>
                <span className="quiz-screen-option-label">
                  {opt.label}.
                </span>
                <span>{opt.value}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
