"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

// API base for Hono server
const API = "http://localhost:3001";

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
  // Current question index
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  // UI state
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimitSec ?? 30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<OptionKey[]>([]);
  const [loading, setLoading] = useState<{
    showQuestion: boolean;
    revealAnswer: boolean;
    startTimer: boolean;
  }>({
    showQuestion: false,
    revealAnswer: false,
    startTimer: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Reset UI when question changes
  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(currentQuestion.timeLimitSec || 30);
    setTimerRunning(false);
    setSelectedOption(null);
    setRevealed(false);
    setUsed5050(false);
    setHiddenOptions([]);
  }, [currentQuestion?.id]);

  // TIMER LOGIC
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) {
      if (timeLeft === 0) {
        setTimerRunning(false);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning, timeLeft]);

  // Build options array
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    return [
      { key: "A", label: "A", value: currentQuestion.optionA },
      { key: "B", label: "B", value: currentQuestion.optionB },
      { key: "C", label: "C", value: currentQuestion.optionC },
      { key: "D", label: "D", value: currentQuestion.optionD },
    ].filter((o) => o.value !== null);
  }, [currentQuestion]);

  if (!currentQuestion) return <div>No questions found.</div>;

  // -------------------------
  // API Calls
  // -------------------------
  const showQuestion = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, showQuestion: true }));
      setError(null);
      
      const response = await fetch(`${API}/show-question`, {
        method: "POST",
        body: JSON.stringify({
          roundId,
          questionId: currentQuestion.id,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to show question');
      }
      
      // Update UI state
      setRevealed(false);
      setTimerRunning(false);
      setSelectedOption(null);
      
      return data.data; // Return the response data
    } catch (err) {
      console.error('Error showing question:', err);
      setError(err instanceof Error ? err.message : 'Failed to show question. Please try again.');
      throw err; // Re-throw to allow error handling in the component
    } finally {
      setLoading(prev => ({ ...prev, showQuestion: false }));
    }
  }, [roundId, currentQuestion?.id]);

  const revealAnswer = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, revealAnswer: true }));
      setError(null);
      
      const response = await fetch(`${API}/reveal-answer`, {
        method: "POST",
        body: JSON.stringify({
          roundId,
          questionId: currentQuestion.id,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reveal answer');
      }
      
      setRevealed(true);
      return data.data;
    } catch (err) {
      console.error('Error revealing answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to reveal answer. Please try again.');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, revealAnswer: false }));
    }
  }, [roundId, currentQuestion?.id]);

  const startTimer = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, startTimer: true }));
      setError(null);
      
      const response = await fetch(`${API}/start-timer`, {
        method: "POST",
        body: JSON.stringify({
          roundId,
          duration: currentQuestion.timeLimitSec || 30,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start timer');
      }
      
      // Start the timer locally
      setTimerRunning(true);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Store the timer ID to clear it later
      return () => clearInterval(timer);
    } catch (err) {
      console.error('Error starting timer:', err);
      setError(err instanceof Error ? err.message : 'Failed to start timer. Please try again.');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, startTimer: false }));
    }
  }, [roundId, currentQuestion?.timeLimitSec]);
  
  // Fetch initial round state
  useEffect(() => {
    const fetchRoundState = async () => {
      try {
        const response = await fetch(`${API}/round/${roundId}/state`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const { currentQuestionId, isAnswerRevealed, isTimerRunning, timeLeft } = data.data;
          
          if (currentQuestionId) {
            // Find the index of the current question
            const questionIndex = questions.findIndex(q => q.id === currentQuestionId);
            if (questionIndex >= 0) {
              setCurrentIndex(questionIndex);
            }
          }
          
          setRevealed(!!isAnswerRevealed);
          setTimerRunning(!!isTimerRunning);
          setTimeLeft(timeLeft || 30);
        }
      } catch (err) {
        console.error('Error fetching round state:', err);
      }
    };
    
    fetchRoundState();
  }, [roundId, questions]);

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Host Panel — {roundName}</h1>
      <h3>{eventName} — {schoolName}</h3>

      {/* HOST ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button 
          onClick={showQuestion} 
          disabled={loading.showQuestion}
          style={{ opacity: loading.showQuestion ? 0.7 : 1 }}
        >
          {loading.showQuestion ? 'Loading...' : '📡 Show Question'}
        </button>
        <button 
          onClick={revealAnswer}
          disabled={revealed || loading.revealAnswer}
          style={{ opacity: (revealed || loading.revealAnswer) ? 0.7 : 1 }}
        >
          {loading.revealAnswer ? 'Loading...' : '🟩 Reveal Answer'}
        </button>
        <button 
          onClick={startTimer}
          disabled={timerRunning || loading.startTimer}
          style={{ opacity: (timerRunning || loading.startTimer) ? 0.7 : 1 }}
        >
          {loading.startTimer ? 'Loading...' : '⏳ Start Timer'}
        </button>
      </div>
      
      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ 
          color: 'red', 
          margin: '10px 0',
          padding: '10px',
          background: '#ffebee',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* TIMER */}
      <div style={{ marginBottom: 12 }}>
        <strong>Timer:</strong> {timeLeft}s
        <button onClick={() => setTimerRunning((v) => !v)} style={{ marginLeft: 8 }}>
          {timerRunning ? "Pause" : "Start"}
        </button>
        <button onClick={() => setTimeLeft(currentQuestion.timeLimitSec)} style={{ marginLeft: 8 }}>
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

      {/* QUESTION */}
      <div><strong>Q{currentQuestion.orderInRound}</strong></div>
      <p style={{ fontSize: 20 }}>{currentQuestion.text}</p>

      {/* OPTIONS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginTop: 12
      }}>
        {options.map((opt) => {
          const isCorrect = revealed && currentQuestion.correctOption === opt.key;
          const isWrong = revealed && selectedOption === opt.key && !isCorrect;
          const hidden = hiddenOptions.includes(opt.key);

          return (
            <button
              key={opt.key}
              disabled={hidden}
              onClick={() => setSelectedOption(opt.key)}
              style={{
                padding: 12,
                borderRadius: 8,
                textAlign: "left",
                opacity: hidden ? 0.3 : 1,
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
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
        >
          Previous
        </button>
        <button
          disabled={!canGoNext}
          onClick={() => setCurrentIndex((i) =>
            i < questions.length - 1 ? i + 1 : i
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
