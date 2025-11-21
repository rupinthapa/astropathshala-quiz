"use client";

import { useEffect, useMemo, useState } from "react";
import "@/styles/quiz-ui.css";

const API_BASE = "http://localhost:3000"; // Hono server

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

type OptionKey = "A" | "B" | "C" | "D";

export default function RoundHostClient({
  eventId,
  roundId,
  eventName,
  schoolName,
  roundName,
  questions,
}: Props) {
  // Which question host is viewing
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  // Local UI state
  const [timeLeft, setTimeLeft] = useState(
    currentQuestion?.timeLimitSec ?? 30
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<OptionKey[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  // When question changes → reset UI
  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimitSec || 30);
    setTimerRunning(false);
    setSelectedOption(null);
    setRevealed(false);
    setUsed5050(false);
    setHiddenOptions([]);
  }, [currentQuestion?.id]);

  // Local countdown
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, timeLeft]);

  // Build option list
  const options = useMemo(() => {
    if (!currentQuestion) return [];

    return [
      { key: "A" as OptionKey, label: "A", value: currentQuestion.optionA },
      { key: "B" as OptionKey, label: "B", value: currentQuestion.optionB },
      { key: "C" as OptionKey, label: "C", value: currentQuestion.optionC },
      { key: "D" as OptionKey, label: "D", value: currentQuestion.optionD },
    ].filter((o) => o.value !== null);
  }, [currentQuestion]);

  // ---------------------------
  // Hono API Helper
  // ---------------------------
  const callApi = async (path: string, data: any) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        console.error("API error", path, await res.text());
      }

      return await res.json();
    } catch (err) {
      console.error("API call failed:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const showQuestion = async () => {
    await callApi("/show-question", {
      roundId,
      questionId: currentQuestion.id,
    });
  };

  const revealAnswer = async () => {
    await callApi("/reveal-answer", {
      roundId,
      questionId: currentQuestion.id,
    });
    setRevealed(true); // update UI
  };

  const startTimer = async () => {
    await callApi("/start-timer", {
      roundId,
      duration: currentQuestion.timeLimitSec || 30,
    });
    setTimerRunning(true); // local UI timer
  };

  // 50:50
  const handle5050 = () => {
    if (used5050 || !currentQuestion.correctOption) return;

    const wrongOptions = options
      .map((o) => o.key)
      .filter((k) => k !== currentQuestion.correctOption);

    setHiddenOptions(wrongOptions.slice(0, 2));
    setUsed5050(true);
  };

  const canGoNext = currentIndex < questions.length - 1;

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="quiz-page">
      <h1>Host Panel — {roundName}</h1>
      <h2>
        {eventName} — {schoolName}
      </h2>

      {/* ACTION BUTTONS */}
      <div className="quiz-toolbar">
        <button
          className="quiz-btn quiz-btn-primary"
          onClick={showQuestion}
          disabled={loadingAction}
        >
          🛰 Show Question
        </button>

        <button
          className="quiz-btn quiz-btn-accent"
          onClick={revealAnswer}
          disabled={loadingAction}
        >
          ✅ Reveal
        </button>

        <button
          className="quiz-btn quiz-btn-outline"
          onClick={startTimer}
          disabled={loadingAction}
        >
          ⏳ Start Timer
        </button>
      </div>

      <div className="quiz-card">
        {/* TIMER ROW */}
        <div className="quiz-timer-row">
          <div>
            <span className="quiz-timer-label">Timer:</span>{" "}
            <span className="quiz-timer-value">{timeLeft}s</span>

            <button
              className="quiz-btn quiz-btn-small"
              onClick={() => setTimerRunning((v) => !v)}
            >
              {timerRunning ? "Pause" : "Start"}
            </button>

            <button
              className="quiz-btn quiz-btn-small"
              onClick={() =>
                setTimeLeft(currentQuestion.timeLimitSec || 30)
              }
            >
              Reset
            </button>
          </div>

          <button
            className="quiz-btn quiz-btn-small quiz-btn-outline"
            onClick={handle5050}
            disabled={used5050}
          >
            50:50 {used5050 ? "(used)" : ""}
          </button>
        </div>

        {/* QUESTION HEADER */}
        <div className="quiz-qmeta">
          <span>
            Q{currentQuestion.orderInRound} / {questions.length}
          </span>
        </div>

        {/* QUESTION TEXT */}
        <p className="quiz-question-text">{currentQuestion.text}</p>

        {/* OPTIONS */}
        <div className="quiz-options-grid">
          {options.map((opt) => {
            const isCorrect =
              revealed && currentQuestion.correctOption === opt.key;

            const isWrong =
              revealed &&
              selectedOption === opt.key &&
              currentQuestion.correctOption !== opt.key;

            const hidden = hiddenOptions.includes(opt.key);

            const classes = [
              "quiz-option-btn",
              isCorrect && "quiz-option-correct",
              isWrong && "quiz-option-wrong",
              hidden && "quiz-option-hidden",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={opt.key}
                className={classes}
                disabled={hidden}
                onClick={() => setSelectedOption(opt.key)}
              >
                <strong>{opt.label}.</strong> {opt.value}
              </button>
            );
          })}
        </div>

        {/* NAVIGATION */}
        <div className="quiz-nav-row">
          <button
            className="quiz-btn quiz-btn-small"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </button>

          <button
            className="quiz-btn quiz-btn-small"
            disabled={!canGoNext}
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
