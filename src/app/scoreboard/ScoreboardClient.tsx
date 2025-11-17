"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";

export default function ScoreboardClient({ initialTeams }: any) {
  const [teams, setTeams] = useState(initialTeams);

  useEffect(() => {
    const channel = pusherClient.subscribe("event-1-scoreboard");

    channel.bind("score-update", async () => {
      console.log("Score updated — reloading…");

      const res = await fetch("/api/scoreboard");
      const data = await res.json();
      setTeams(data.teams);
    });

    return () => {
      pusherClient.unsubscribe("event-1-scoreboard");
    };
  }, []);

  return (
    <div style={{ padding: 40, color: "white", textAlign: "center" }}>
      <h1>🏆 Live Scoreboard</h1>

      {teams.map((t: any) => (
        <div
          key={t.id}
          style={{
            fontSize: 32,
            padding: "12px 0",
            borderBottom: "1px solid #444",
          }}
        >
          <strong>{t.name}</strong> — {t.score} pts
        </div>
      ))}
    </div>
  );
}
