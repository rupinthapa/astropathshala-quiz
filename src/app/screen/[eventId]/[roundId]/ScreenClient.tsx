"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3001";

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
  hiddenOptions?: string[];
};

export default function ScreenClient({
  eventId,
  roundId,
  eventName,
  schoolName,
  roundName,
  questions,
}: Props) {
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashEffect, setFlashEffect] = useState<"reveal" | null>(null);

  // -------------------------
  // POLLING SERVER STATE
  // -------------------------
  useEffect(() => {
    let mounted = true;
    let lastAnswerRevealed = answerRevealed;

    const fetchState = async () => {
      try {
        const res = await fetch(`${API_BASE}/round/${roundId}/state`, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        
        if (!mounted) return;

        // Check if response has expected structure
        if (!json.success || !json.data) {
          console.warn("Unexpected API response structure:", json);
          setError("Invalid response from server");
          setIsLoading(false);
          return;
        }

        const state = json.data as RoundState;

        // Update all states from server
        setCurrentQuestionId(state.currentQuestionId);
        setAnswerRevealed(state.isAnswerRevealed);
        setHiddenOptions(state.hiddenOptions || []);
        setError(null);
        setIsLoading(false);

        // Trigger flash effect when answer is newly revealed
        if (state.isAnswerRevealed && !lastAnswerRevealed) {
          setFlashEffect("reveal");
          setTimeout(() => setFlashEffect(null), 2000);
        }
        lastAnswerRevealed = state.isAnswerRevealed;

        // Timer synchronization
        if (state.isTimerRunning) {
          if (!timerRunning) {
            setTimerRunning(true);
            setTimeLeft(state.timeLeft);
          }
          // Sync time periodically to avoid drift
          if (Math.abs(timeLeft - state.timeLeft) > 2) {
            setTimeLeft(state.timeLeft);
          }
        } else if (timerRunning) {
          setTimerRunning(false);
          setTimeLeft(0);
        }

      } catch (err) {
        console.error("Error polling state:", err);
        if (mounted) {
          setError("Connection to server failed");
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchState();
    
    // Poll every 500ms for responsive updates
    const intervalId = setInterval(fetchState, 500);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [roundId]); // Removed dependencies that cause re-polling issues

  // -------------------------
  // LOCAL COUNTDOWN
  // -------------------------
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && timerRunning) {
        setTimerRunning(false);
      }
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((t) => {
        const newTime = t - 1;
        if (newTime <= 0) {
          setTimerRunning(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning, timeLeft]);

  // -------------------------
  // FIND CURRENT QUESTION
  // -------------------------
  const currentQuestion = useMemo(() => {
    if (!currentQuestionId || !questions) return null;
    return questions.find((q) => q.id === currentQuestionId) ?? null;
  }, [questions, currentQuestionId]);

  // -------------------------
  // BUILD OPTIONS
  // -------------------------
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    
    return [
      { key: "A", label: "A", value: currentQuestion.optionA },
      { key: "B", label: "B", value: currentQuestion.optionB },
      { key: "C", label: "C", value: currentQuestion.optionC },
      { key: "D", label: "D", value: currentQuestion.optionD },
    ].filter((o) => o.value !== null);
  }, [currentQuestion]);

  // -------------------------
  // RENDER - LOADING
  // -------------------------
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "white"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            animation: "spin 2s linear infinite"
          }}>⏳</div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Connecting to quiz...</h2>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // -------------------------
  // RENDER - NO QUESTION
  // -------------------------
  if (!currentQuestion) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "white",
        padding: "2rem"
      }}>
        <div style={{
          fontSize: "5rem",
          marginBottom: "2rem",
          animation: "float 3s ease-in-out infinite"
        }}>
          🎯
        </div>
        <h1 style={{ 
          fontSize: "3rem", 
          margin: 0,
          textAlign: "center",
          textShadow: "0 2px 10px rgba(0,0,0,0.3)"
        }}>
          Waiting for next question...
        </h1>
        <p style={{ 
          fontSize: "1.5rem", 
          marginTop: "1rem",
          opacity: 0.9
        }}>
          {eventName} • {roundName}
        </p>
        {error && (
          <div style={{
            marginTop: "2rem",
            padding: "1rem 2rem",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "8px",
            fontSize: "1rem"
          }}>
            ⚠️ {error}
          </div>
        )}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  // -------------------------
  // RENDER - MAIN SCREEN
  // -------------------------
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "2rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Flash Effect Overlay */}
      {flashEffect && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 215, 0, 0.9)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "flashFade 2s ease-out",
          pointerEvents: "none"
        }}>
          <div style={{
            fontSize: "6rem",
            color: "white",
            fontWeight: "bold",
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            animation: "scaleIn 0.5s ease-out"
          }}>
            ✨ ANSWER REVEALED! ✨
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
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "3rem",
        padding: "1.5rem",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: "16px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: "2rem",
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            {eventName}
          </h2>
          <p style={{
            margin: "0.5rem 0 0 0",
            fontSize: "1.2rem",
            color: "rgba(255,255,255,0.9)"
          }}>
            {schoolName} • {roundName}
          </p>
        </div>

        {timerRunning && (
          <div style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: timeLeft <= 5 ? "#ff4757" : timeLeft <= 10 ? "#ffa502" : "#2ed573",
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "1rem 2rem",
            borderRadius: "16px",
            minWidth: "150px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            animation: timeLeft <= 5 ? "pulse 1s infinite" : "none"
          }}>
            ⏳ {timeLeft}s
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* Question */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
          padding: "3rem",
          marginBottom: "3rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "slideIn 0.5s ease-out"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "2px solid #e0e0e0"
          }}>
            <span style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#667eea"
            }}>
              Question {currentQuestion.orderInRound}
            </span>
            <span style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#764ba2"
            }}>
              🏆 {currentQuestion.points} points
            </span>
          </div>
          
          <h1 style={{
            fontSize: "2.5rem",
            lineHeight: "1.4",
            margin: 0,
            color: "#2c3e50",
            fontWeight: "600"
          }}>
            {currentQuestion.text}
          </h1>
        </div>

        {/* Options Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "2rem",
          animation: "slideIn 0.7s ease-out"
        }}>
          {options.map((opt, index) => {
            const isCorrect = answerRevealed && currentQuestion.correctOption === opt.key;
            const isHidden = hiddenOptions.includes(opt.key);

            let backgroundColor = "rgba(255,255,255,0.95)";
            let borderColor = "transparent";
            let transform = "scale(1)";
            let boxShadow = "0 10px 30px rgba(0,0,0,0.2)";

            if (isCorrect) {
              backgroundColor = "#2ed573";
              borderColor = "#26de81";
              transform = "scale(1.05)";
              boxShadow = "0 20px 60px rgba(46, 213, 115, 0.4)";
            }

            return (
              <div
                key={opt.key}
                style={{
                  padding: "2rem",
                  backgroundColor,
                  border: `4px solid ${borderColor}`,
                  borderRadius: "20px",
                  transform,
                  boxShadow,
                  transition: "all 0.3s ease",
                  opacity: isHidden ? 0.3 : 1,
                  position: "relative",
                  overflow: "hidden",
                  animation: `slideIn ${0.5 + index * 0.1}s ease-out`
                }}
              >
                {isCorrect && (
                  <div style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    fontSize: "3rem",
                    animation: "scaleIn 0.5s ease-out"
                  }}>
                    ✓
                  </div>
                )}

                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem"
                }}>
                  <span style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: isCorrect ? "white" : "#667eea",
                    minWidth: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isCorrect ? "rgba(255,255,255,0.3)" : "rgba(102, 126, 234, 0.1)",
                    borderRadius: "12px"
                  }}>
                    {opt.label}
                  </span>
                  
                  <span style={{
                    flex: 1,
                    fontSize: "1.8rem",
                    lineHeight: "1.6",
                    color: isCorrect ? "white" : "#2c3e50",
                    fontWeight: isCorrect ? "600" : "normal",
                    paddingTop: "0.5rem"
                  }}>
                    {opt.value}
                  </span>
                </div>

                {isHidden && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "20px",
                    fontSize: "3rem"
                  }}>
                    🚫
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Debug Info (can be removed in production) */}
      {error && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          padding: "1rem 1.5rem",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          fontSize: "0.9rem",
          color: "#ff4757",
          fontWeight: "600",
          maxWidth: "300px"
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}