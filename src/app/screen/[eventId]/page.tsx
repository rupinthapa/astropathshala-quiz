// src/app/screen/[eventId]/page.tsx
"use client";

import { useEffect, useState } from "react";

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
};

export default function ScreenPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  const [question, setQuestion] = useState<Question | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isFiftyUsed, setIsFiftyUsed] = useState(false);

  useEffect(() => {
    const fetchState = async () => {
      const res = await fetch(`/api/events/${eventId}/state`, {
        cache: "no-store",
      });
      const data = await res.json();
      setQuestion(data.question);
      setIsAnswerRevealed(data.state?.isAnswerRevealed ?? false);
      setIsFiftyUsed(data.state?.isFiftyUsed ?? false);
    };

    fetchState();
    const interval = setInterval(fetchState, 800); // ~ real-time
    return () => clearInterval(interval);
  }, [eventId]);

  if (!question) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Waiting for host to start the round…</h1>
      </main>
    );
  }

  // For 50:50 we’ll hide 2 wrong options on this screen
  const options = [
    { key: "A", value: question.optionA },
    { key: "B", value: question.optionB },
    { key: "C", value: question.optionC },
    { key: "D", value: question.optionD },
  ];

  return (
    <main style={{ padding: 40 }}>
      {/* Later: apply your purple/space theme CSS here */}
      <h2>ANTARIKSHA VIGYAAN SPARDHA</h2>
      <h3>Round 1 – Timetellers</h3>

      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: 24 }}>{question.text}</p>
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {options.map((opt) => {
          if (!opt.value) return null;

          // basic 50:50 behaviour (for now handled by host deciding which to hide later)
          const isCorrect =
            isAnswerRevealed && opt.key === question.correctOption;
          const isWrong =
            isAnswerRevealed && opt.key !== question.correctOption;

          return (
            <div
              key={opt.key}
              style={{
                padding: 16,
                borderRadius: 8,
                border: "2px solid white",
                fontSize: 20,
                backgroundColor: isCorrect
                  ? "green"
                  : isWrong
                  ? "red"
                  : "transparent",
              }}
            >
              {opt.key}. {opt.value}
            </div>
          );
        })}
      </div>
    </main>
  );
}
