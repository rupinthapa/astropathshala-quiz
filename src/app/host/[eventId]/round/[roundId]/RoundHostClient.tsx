"use client";

import { useEffect, useMemo, useState } from "react";

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
  // Which question is selected
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  // UI state
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimitSec ?? 30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<OptionKey[]>([]);

  // Reset state on question change
  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimitSec || 30);
    setTimerRunning(false);
    setSelectedOption(null);
    setRevealed(false);
    setUsed5050(false);
    setHiddenOptions([]);
  }, [currentQuestion?.id]);

  // Timer ticking
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, timeLeft]);

  const options = useMemo(() => {
    if (!currentQuestion) return [];

    return [
      { key: "A" as OptionKey, label: "A", value: currentQuestion.optionA },
      { key: "B" as OptionKey, label: "B", value: currentQuestion.optionB },
      { key: "C" as OptionKey, label: "C", value: currentQuestion.optionC },
      { key: "D" as OptionKey, label: "D", value: currentQuestion.optionD },
    ].filter((o) => o.value !== null);
  }, [currentQuestion]);

  if (!currentQuestion) {
    return <div style={{ padding: 20 }}>No questions in this round yet.</div>;
  }

  // 50:50 logic
  const handle5050 = () => {
    if (used5050 || !currentQuestion.correctOption) return;

    const wrong = options
      .map((o) => o.key)
      .filter((k) => k !== currentQuestion.correctOption);

    setHiddenOptions(wrong.slice(0, 2));
    setUsed5050(true);
  };

  const canGoNext = currentIndex < questions.length - 1;

  // ---------------------------------------
  // REALTIME HOST BUTTON ACTIONS (API CALLS)
  // ---------------------------------------

  const showQuestion = () => {
    fetch("/api/quiz/show-question", {
      method: "POST",
      body: JSON.stringify({
        roundId,
        questionId: currentQuestion.id,
      }),
    });
  };

  const revealAnswer = () => {
    fetch("/api/quiz/reveal-answer", {
      method: "POST",
      body: JSON.stringify({
        roundId,
        questionId: currentQuestion.id,
      }),
    });
    setRevealed(true);
  };

  const startTimer = () => {
    fetch("/api/quiz/start-timer", {
      method: "POST",
      body: JSON.stringify({
        roundId,
        duration: currentQuestion.timeLimitSec || 30,
      }),
    });
    setTimerRunning(true);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Host Panel — {roundName}</h1>
      <h3>
        {eventName} — {schoolName}
      </h3>

      {/* CONTROL BUTTONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={showQuestion}>📡 Show Question on Screen</button>
        <button onClick={revealAnswer}>🟩 Reveal Answer</button>
        <button onClick={startTimer}>⏳ Start Timer</button>
      </div>

      {/* TIMER & CONTROLS */}
      <div style={{ marginBottom: 16 }}>
        <strong>Timer:</strong> {timeLeft}s{" "}
        <button onClick={() => setTimerRunning((v) => !v)}>
          {timerRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => setTimeLeft(currentQuestion.timeLimitSec || 30)}
          style={{ marginLeft: 8 }}
        >
          Reset
        </button>

        <button
          onClick={handle5050}
          disabled={used5050}
          style={{ marginLeft: 16 }}
        >
          50:50 {used5050 ? "(used)" : ""}
        </button>
      </div>

      {/* QUESTION DISPLAY */}
      <div style={{ marginBottom: 12 }}>
        <strong>
          Q{currentQuestion.orderInRound} / {questions.length}
        </strong>
      </div>

      <p style={{ fontSize: 20, marginBottom: 16 }}>{currentQuestion.text}</p>

      {/* OPTIONS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {options.map((opt) => {
          if (hiddenOptions.includes(opt.key)) {
            return (
              <div
                key={opt.key}
                style={{
                  opacity: 0.3,
                  padding: 12,
                  border: "1px solid #444",
                  borderRadius: 8,
                }}
              >
                {opt.label}. {opt.value}
              </div>
            );
          }

          const isCorrect =
            revealed &&
            currentQuestion.correctOption === opt.key;

          const isWrong =
            revealed &&
            selectedOption === opt.key &&
            currentQuestion.correctOption !== opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => setSelectedOption(opt.key)}
              style={{
                padding: 12,
                borderRadius: 8,
                textAlign: "left",
                background: isCorrect
                  ? "#14532d"
                  : isWrong
                  ? "#7f1d1d"
                  : "#222",
                border:
                  selectedOption === opt.key
                    ? "2px solid #eab308"
                    : "1px solid #444",
                color: "white",
              }}
            >
              <strong>{opt.label}.</strong> {opt.value}
            </button>
          );
        })}
      </div>

      {/* NAVIGATION */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        <button
          onClick={() =>
            setCurrentIndex((i) =>
              i < questions.length - 1 ? i + 1 : i
            )
          }
          disabled={!canGoNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
