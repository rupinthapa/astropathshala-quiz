"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function ScreenClient({ channel }: any) {
  const [question, setQuestion] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const ch = pusher.subscribe(channel);

    ch.bind("show-question", (data: any) => {
      setShowAnswer(false);
      setQuestion(null);
      setTimeout(() => {
        setQuestion(data.question);
      }, 100);
    });

    ch.bind("reveal-answer", () => {
      setShowAnswer(true);
    });

    ch.bind("start-timer", (data: any) => {
      setTimer(data.duration);
    });

    return () => {
      pusher.unsubscribe(channel);
    };
  }, [channel]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "white" }}>
      
      {!question && <h1>No question selected yet…</h1>}

      {question && (
        <>
          <h1>{question.text}</h1>

          <h2>A: {question.optionA}</h2>
          <h2>B: {question.optionB}</h2>
          <h2>C: {question.optionC}</h2>
          <h2>D: {question.optionD}</h2>

          {showAnswer && (
            <h1 style={{ color: "yellow", marginTop: "20px" }}>
              Correct Answer: {question.correctOption}
            </h1>
          )}

          {timer > 0 && (
            <h1 style={{ marginTop: "30px" }}>⏳ {timer} seconds</h1>
          )}
        </>
      )}
    </div>
  );
}
