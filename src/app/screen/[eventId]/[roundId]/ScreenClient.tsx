"use client";

import { useEffect, useState } from "react";
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
  orderInRound: number;
};

export default function ScreenClient({
  initialQuestion,
  channelName,
}: {
  initialQuestion: Question | null;
  channelName: string; // ex: "event-1-round-1"
}) {
  const [question, setQuestion] = useState<Question | null>(initialQuestion);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;

    const id = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [timer]);

  // Subscribe to Pusher events
  useEffect(() => {
    const channel = pusherClient.subscribe(channelName);

    // 1) HOST PRESSED "SHOW QUESTION"
    channel.bind("show-question", (data: { question: Question }) => {
      setQuestion(data.question);
      setShowAnswer(false);
      setTimer(0);
    });

    // 2) HOST PRESSED "REVEAL ANSWER"
    channel.bind("reveal-answer", () => {
      setShowAnswer(true);
    });

    // 3) HOST PRESSED "START TIMER"
    channel.bind("start-timer", (data: { duration: number }) => {
      setTimer(data.duration);
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName]);

  if (!question) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "white" }}>
        <h1>No question selected yet…</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>{question.text}</h1>

      {/* OPTIONS */}
      <div style={{ fontSize: 28, lineHeight: "60px" }}>
        <div>A: {question.optionA}</div>
        <div>B: {question.optionB}</div>
        <div>C: {question.optionC}</div>
        <div>D: {question.optionD}</div>
      </div>

      {/* REVEAL ANSWER */}
      {showAnswer && (
        <h1 style={{ marginTop: 40, color: "lime", fontSize: 48 }}>
          ✅ Correct Answer: {question.correctOption}
        </h1>
      )}

      {/* TIMER */}
      {timer > 0 && (
        <h1 style={{ marginTop: 40, fontSize: 48 }}>⏳ {timer}s</h1>
      )}
    </div>
  );
}
