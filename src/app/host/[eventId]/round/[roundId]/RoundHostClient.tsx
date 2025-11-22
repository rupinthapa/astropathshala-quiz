"use client";

import { useEffect, useMemo, useState } from "react";

// Mock API for demonstration - replace with your actual API
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
  eventId?: number;
  roundId?: number;
  eventName?: string;
  schoolName?: string;
  roundName?: string;
  questions?: Question[];
};

type OptionKey = "A" | "B" | "C" | "D";

// Demo data for testing
const demoQuestions: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    optionA: "London",
    optionB: "Paris",
    optionC: "Berlin",
    optionD: "Madrid",
    correctOption: "B",
    timeLimitSec: 30,
    points: 10,
    orderInRound: 1,
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    optionA: "Venus",
    optionB: "Jupiter",
    optionC: "Mars",
    optionD: "Saturn",
    correctOption: "C",
    timeLimitSec: 25,
    points: 10,
    orderInRound: 2,
  },
  {
    id: 3,
    text: "What is 2 + 2?",
    optionA: "3",
    optionB: "4",
    optionC: "5",
    optionD: "6",
    correctOption: "B",
    timeLimitSec: 15,
    points: 5,
    orderInRound: 3,
  },
];

export default function RoundHostClient({
  eventId = 1,
  roundId = 1,
  eventName = "Quiz Competition",
  schoolName = "Demo School",
  roundName = "Round 1",
  questions = demoQuestions,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions?.[currentIndex];

  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimitSec ?? 30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<OptionKey[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionShown, setQuestionShown] = useState(false);

  // Full screen flash effect for correct/wrong answers
  const [flashEffect, setFlashEffect] = useState<"correct" | "wrong" | null>(null);

  // Reset UI when question changes
  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimitSec || 30);
    setTimerRunning(false);
    setSelectedOption(null);
    setRevealed(false);
    setUsed5050(false);
    setHiddenOptions([]);
    setError(null);
    setQuestionShown(false);
    setFlashEffect(null);
  }, [currentQuestion?.id]);

  // Local countdown timer
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, timeLeft]);

  // Clear flash effect after animation
  useEffect(() => {
    if (flashEffect) {
      const timer = setTimeout(() => setFlashEffect(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [flashEffect]);

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

  // API Helper with mock fallback
  const callApi = async (path: string, data: any) => {
    setLoadingAction(true);
    setError(null);
    
    try {
      // Try real API first
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      // If API fails, use mock mode
      console.warn(`API not available for ${path}, using mock mode:`, err);
      
      // Simulate successful API response
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { success: true, message: `Mock: ${path} executed` };
    } finally {
      setLoadingAction(false);
    }
  };

  const showQuestion = async () => {
    try {
      await callApi("/show-question", {
        roundId,
        questionId: currentQuestion.id,
      });
      setQuestionShown(true);
      setError(null);
    } catch (err) {
      setError("Failed to show question");
    }
  };

  const revealAnswer = async () => {
    try {
      await callApi("/reveal-answer", {
        roundId,
        questionId: currentQuestion.id,
      });
      setRevealed(true);
      
      // Trigger flash effect based on selected answer
      if (selectedOption) {
        if (selectedOption === currentQuestion.correctOption) {
          setFlashEffect("correct");
        } else {
          setFlashEffect("wrong");
        }
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to reveal answer");
    }
  };

  const startTimer = async () => {
    try {
      await callApi("/start-timer", {
        roundId,
        questionId: currentQuestion.id,
        duration: currentQuestion.timeLimitSec || 30,
      });
      setTimerRunning(true);
      setTimeLeft(currentQuestion.timeLimitSec || 30);
      setError(null);
    } catch (err) {
      setError("Failed to start timer");
    }
  };

  const handle5050 = async () => {
    if (used5050 || !currentQuestion.correctOption) return;

    const wrongOptions = options
      .map((o) => o.key)
      .filter((k) => k !== currentQuestion.correctOption);

    if (wrongOptions.length < 2) {
      setError("Not enough wrong options for 50:50");
      return;
    }

    const toHide = wrongOptions.slice(0, 2);
    
    try {
      await callApi("/use-5050", {
        roundId,
        questionId: currentQuestion.id,
        hiddenOptions: toHide,
      });
      
      setHiddenOptions(toHide);
      setUsed5050(true);
      setError(null);
    } catch (err) {
      setError("Failed to use 50:50");
    }
  };

  const canGoNext = currentIndex < (questions?.length || 0) - 1;
  const canGoPrev = currentIndex > 0;

  // Handle empty questions array
  if (!questions || questions.length === 0 || !currentQuestion) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Host Panel — {roundName}</h1>
        <p style={{ color: "#666" }}>No questions available for this round.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      maxWidth: "1400px", 
      margin: "0 auto",
      minHeight: "100vh",
      position: "relative"
    }}>
      {/* Flash Effect Overlay */}
      {flashEffect && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: flashEffect === "correct" ? "rgba(40, 167, 69, 0.8)" : "rgba(220, 53, 69, 0.8)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "flashFade 2s ease-out",
          pointerEvents: "none"
        }}>
          <div style={{
            fontSize: "5rem",
            color: "white",
            fontWeight: "bold",
            textShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            {flashEffect === "correct" ? "✓ CORRECT!" : "✗ WRONG!"}
          </div>
        </div>
      )}

      <style>{`
        @keyframes flashFade {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ 
          marginBottom: "0.5rem", 
          fontSize: "2rem",
          color: "#1a1a1a"
        }}>
          🎯 Host Panel — {roundName}
        </h1>
        <h2 style={{ 
          color: "#666", 
          fontWeight: "normal", 
          marginTop: 0,
          fontSize: "1.2rem"
        }}>
          {eventName} — {schoolName}
        </h2>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: "1rem 1.5rem",
          marginBottom: "1.5rem",
          backgroundColor: "#fee",
          border: "2px solid #fcc",
          borderRadius: "8px",
          color: "#c00",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "1rem"
        }}>
          <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#c00"
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "2rem", 
        flexWrap: "wrap" 
      }}>
        <button
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            backgroundColor: questionShown ? "#28a745" : "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loadingAction ? "not-allowed" : "pointer",
            opacity: loadingAction ? 0.6 : 1,
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
          onClick={showQuestion}
          disabled={loadingAction}
          onMouseEnter={(e) => !loadingAction && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {questionShown ? "✓" : "🛰"} {questionShown ? "Question Shown" : "Show Question"}
        </button>

        <button
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            backgroundColor: revealed ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loadingAction || !selectedOption ? "not-allowed" : "pointer",
            opacity: loadingAction || !selectedOption ? 0.6 : 1,
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
          onClick={revealAnswer}
          disabled={loadingAction || !selectedOption}
          onMouseEnter={(e) => !loadingAction && selectedOption && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          ✅ {revealed ? "Answer Revealed" : "Reveal Answer"}
        </button>

        <button
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            backgroundColor: timerRunning ? "#ffc107" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loadingAction ? "not-allowed" : "pointer",
            opacity: loadingAction ? 0.6 : 1,
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
          onClick={startTimer}
          disabled={loadingAction}
          onMouseEnter={(e) => !loadingAction && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          ⏳ Start Timer
        </button>
      </div>

      <div style={{
        border: "2px solid #e0e0e0",
        borderRadius: "12px",
        padding: "2rem",
        backgroundColor: "white",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}>
        {/* TIMER ROW */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "1.5rem",
          borderBottom: "2px solid #f0f0f0"
        }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>Timer:</span>
            <span style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: timeLeft <= 5 ? "#dc3545" : timeLeft <= 10 ? "#ffc107" : "#28a745",
              minWidth: "100px",
              animation: timeLeft <= 5 ? "pulse 1s infinite" : "none"
            }}>
              {timeLeft}s
            </span>

            <button
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                fontWeight: "600",
                backgroundColor: timerRunning ? "#ffc107" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onClick={() => setTimerRunning((v) => !v)}
            >
              {timerRunning ? "⏸ Pause" : "▶ Start"}
            </button>

            <button
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                fontWeight: "600",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onClick={() => {
                setTimeLeft(currentQuestion.timeLimitSec || 30);
                setTimerRunning(false);
              }}
            >
              🔄 Reset
            </button>
          </div>

          <button
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              backgroundColor: used5050 ? "#e0e0e0" : "#ff6b6b",
              color: used5050 ? "#999" : "white",
              border: "none",
              borderRadius: "8px",
              cursor: used5050 ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: used5050 ? "none" : "0 2px 8px rgba(255,107,107,0.3)"
            }}
            onClick={handle5050}
            disabled={used5050}
          >
            🎲 50:50 {used5050 ? "(Used)" : ""}
          </button>
        </div>

        {/* QUESTION HEADER */}
        <div style={{ 
          marginBottom: "1.5rem", 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px"
        }}>
          <span style={{ 
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#495057"
          }}>
            📝 Question {currentQuestion.orderInRound} of {questions?.length || 0}
          </span>
          <span style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#0066cc"
          }}>
            🏆 {currentQuestion.points} points
          </span>
        </div>

        {/* QUESTION TEXT */}
        <p style={{
          fontSize: "1.5rem",
          fontWeight: "500",
          marginBottom: "2rem",
          lineHeight: "1.6",
          color: "#212529",
          padding: "1.5rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          borderLeft: "4px solid #0066cc"
        }}>
          {currentQuestion.text}
        </p>

        {/* SELECTED OPTION INDICATOR */}
        {selectedOption && !revealed && (
          <div style={{
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: "#fff3cd",
            border: "2px solid #ffc107",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "1.1rem"
          }}>
            📌 Selected Answer: Option {selectedOption}
          </div>
        )}

        {/* OPTIONS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          {options.map((opt) => {
            const isCorrect = revealed && currentQuestion.correctOption === opt.key;
            const isWrong = revealed && selectedOption === opt.key && currentQuestion.correctOption !== opt.key;
            const hidden = hiddenOptions.includes(opt.key);
            const isSelected = selectedOption === opt.key && !revealed;

            let backgroundColor = "#ffffff";
            let borderColor = "#dee2e6";
            let textColor = "#212529";
            
            if (isCorrect) {
              backgroundColor = "#d4edda";
              borderColor = "#28a745";
              textColor = "#155724";
            } else if (isWrong) {
              backgroundColor = "#f8d7da";
              borderColor = "#dc3545";
              textColor = "#721c24";
            } else if (isSelected) {
              backgroundColor = "#fff3cd";
              borderColor = "#ffc107";
              textColor = "#856404";
            }

            return (
              <button
                key={opt.key}
                style={{
                  padding: "1.5rem",
                  textAlign: "left",
                  border: `3px solid ${borderColor}`,
                  borderRadius: "12px",
                  backgroundColor,
                  color: textColor,
                  cursor: hidden ? "not-allowed" : "pointer",
                  opacity: hidden ? 0.3 : 1,
                  fontSize: "1.1rem",
                  fontWeight: isSelected || isCorrect || isWrong ? "600" : "normal",
                  transition: "all 0.2s",
                  boxShadow: isSelected || isCorrect || isWrong ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 6px rgba(0,0,0,0.08)",
                  transform: isSelected || isCorrect || isWrong ? "scale(1.02)" : "scale(1)",
                  position: "relative"
                }}
                disabled={hidden || revealed}
                onClick={() => !revealed && setSelectedOption(opt.key)}
                onMouseEnter={(e) => {
                  if (!hidden && !revealed) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hidden && !revealed && !isSelected) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    minWidth: "30px"
                  }}>
                    {opt.label}.
                  </span>
                  <span style={{ flex: 1, lineHeight: "1.5" }}>
                    {opt.value}
                  </span>
                  {isCorrect && (
                    <span style={{ fontSize: "1.5rem", marginLeft: "auto" }}>✓</span>
                  )}
                  {isWrong && (
                    <span style={{ fontSize: "1.5rem", marginLeft: "auto" }}>✗</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* NAVIGATION */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          gap: "1rem",
          paddingTop: "1.5rem",
          borderTop: "2px solid #f0f0f0"
        }}>
          <button
            style={{
              padding: "0.75rem 2rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              backgroundColor: canGoPrev ? "#0066cc" : "#e0e0e0",
              color: canGoPrev ? "white" : "#999",
              border: "none",
              borderRadius: "8px",
              cursor: canGoPrev ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: canGoPrev ? "0 2px 8px rgba(0,0,0,0.15)" : "none"
            }}
            disabled={!canGoPrev}
            onClick={() => setCurrentIndex((i) => i - 1)}
            onMouseEnter={(e) => canGoPrev && (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            ← Previous Question
          </button>

          <button
            style={{
              padding: "0.75rem 2rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              backgroundColor: canGoNext ? "#0066cc" : "#e0e0e0",
              color: canGoNext ? "white" : "#999",
              border: "none",
              borderRadius: "8px",
              cursor: canGoNext ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: canGoNext ? "0 2px 8px rgba(0,0,0,0.15)" : "none"
            }}
            disabled={!canGoNext}
            onClick={() => setCurrentIndex((i) => i + 1)}
            onMouseEnter={(e) => canGoNext && (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Next Question →
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        textAlign: "center",
        color: "#6c757d",
        fontSize: "0.9rem"
      }}>
        💡 <strong>Tip:</strong> Select an answer option before clicking "Reveal Answer" to see the full-screen effect
      </div>
    </div>
  );
}