"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";

export default function ScoreboardClient({ eventId, initialTeams }) {
  const [teams, setTeams] = useState(initialTeams);

  useEffect(() => {
    const channel = pusherClient.subscribe(`event-${eventId}-scores`);

    channel.bind("score-update", (data: any) => {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === data.teamId
            ? { ...team, score: data.score }
            : team
        ).sort((a, b) => b.score - a.score)
      );
    });

    return () => {
      pusherClient.unsubscribe(`event-${eventId}-scores`);
    };
  }, []);

  return (
    <div
      style={{
        color: "white",
        textAlign: "center",
        padding: "40px",
        fontSize: 40,
      }}
    >
      <h1>Live Scoreboard</h1>

      {teams.map((team) => (
        <div key={team.id} style={{ marginTop: 20 }}>
          {team.name}: <strong>{team.score}</strong>
        </div>
      ))}
    </div>
  );
}
