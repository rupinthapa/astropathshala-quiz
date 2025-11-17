"use client";

import { useEffect, useMemo, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";

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
  // Which question host sees
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  // UI states
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimitSec ?? 30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<OptionKey[]>([]);

  // Reset when question changes
  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimitSec || 30);
    setTimerRunning(false);
    setSelectedOption(null);
    setRevealed(false);
    setUsed5050(false);
    setHiddenOptions([]);
  }, [currentQuestion?.id]);

  // Timer tick
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, timeLeft]);

  // Build options list
  const options = useMemo(() => {
    if (!currentQuestion) return [];

    return [
      { key: "A", label: "A", value: currentQuestion.optionA },
      { key: "B", label: "B", value: currentQuestion.optionB },
      { key: "C", label: "C", value: currentQuestion.optionC },
      { key: "D", label: "D", value: currentQuestion.optionD },
    ].filter((o) => o.value !== null);
  }, [currentQuestion]);

  if (!currentQuestion) {
    return <div>No questions in this round.</div>;
  }

  // -------------------------
  // REALTIME API BUTTON CALLS
  // -------------------------
  const showQuestion = async () => {
    await fetch("/api/quiz/show-question", {
      method: "POST",
      body: JSON.stringify({
        roundId,
        questionId: currentQuestion.id,
      }),
    });
  };

  const revealAnswer = async () => {
    await fetch("/api/quiz/reveal-answer", {
      method: "POST",
      body: JSON.stringify({
        roundId,
        questionId: currentQuestion.id,
      }),
    });

    setRevealed(true);
  };

  const startTimer = async () => {
    await fetch("/api/quiz/start-timer", {
      method: "POST",
      body: JSON.stringify({
        roundId,
        duration: currentQuestion.timeLimitSec || 30,
      }),
    });

    setTimerRunning(true);
  };

  // 50-50
  const handle5050 = () => {
    if (used5050 || !currentQuestion.correctOption) return;

    const wrong = options
      .map((o) => o.key)
      .filter((k) => k !== currentQuestion.correctOption);

    setHiddenOptions(wrong.slice(0, 2));
    setUsed5050(true);
  };

  const canGoNext = currentIndex < questions.length - 1;

  return (
    <div style={{ padding: 20 }}>
      <h1>Host Panel — {roundName}</h1>
      <h3>{eventName} — {schoolName}</h3>

      {/* HOST ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={showQuestion}>📡 Show Question</button>
        <button onClick={revealAnswer}>🟩 Reveal</button>
        <button onClick={startTimer}>⏳ Start Timer</button>
      </div>

      {/* TIMER */}
      <div style={{ marginBottom: 12 }}>
        <strong>Timer:</strong> {timeLeft}s
        <button onClick={() => setTimerRunning((v) => !v)} style={{ marginLeft: 8 }}>
          {timerRunning ? "Pause" : "Start"}
        </button>
        <button onClick={() => setTimeLeft(currentQuestion.timeLimitSec)} style={{ marginLeft: 8 }}>
          Reset
        </button>

        <button onClick={handle5050} disabled={used5050} style={{ marginLeft: 16 }}>
          50:50 {used5050 ? "(used)" : ""}
        </button>
      </div>

      {/* QUESTION */}
      <div><strong>Q{currentQuestion.orderInRound}</strong></div>
      <p style={{ fontSize: 20 }}>{currentQuestion.text}</p>

      {/* OPTIONS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {options.map((opt) => {
          const isCorrect = revealed && currentQuestion.correctOption === opt.key;
          const isWrong = revealed && selectedOption === opt.key && !isCorrect;

          return (
            <button
              key={opt.key}
              onClick={() => setSelectedOption(opt.key)}
              disabled={hiddenOptions.includes(opt.key)}
              style={{
                padding: 12,
                textAlign: "left",
                opacity: hiddenOptions.includes(opt.key) ? 0.3 : 1,
                background: isCorrect ? "#14532d" : isWrong ? "#7f1d1d" : "#222",
                border: selectedOption === opt.key ? "2px solid yellow" : "1px solid gray",
                color: "white",
                borderRadius: 8,
              }}
            >
              <strong>{opt.label}.</strong> {opt.value}
            </button>
          );
        })}
      </div>

      {/* NAVIGATION */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>
          Previous
        </button>
        <button disabled={!canGoNext} onClick={() => setCurrentIndex(currentIndex + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
