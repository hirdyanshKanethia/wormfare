import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaders, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/leaderboard`
        );
        const data = await response.json();
        setLeaderboard(data || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="garden-panel h-full flex flex-col overflow-hidden bg-underground/40">
      <h2 className="text-3xl text-sunflower mb-6 flex items-center gap-3">
        <span className="text-4xl">🏆</span> GARDEN HEROES
      </h2>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-10 opacity-40 animate-pulse">Digging for data...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-10 opacity-40 italic font-light">The garden is empty...</div>
        ) : (
          leaders.map((player, index) => (
            <div 
              key={player.user_id} 
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                index === 0 ? "bg-sunflower/10 border-sunflower/50" : "bg-white/5 border-white/5"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-xl ${
                index === 0 ? "bg-sunflower text-underground shadow-[0_4px_0_0_#A0522D]" : "bg-clay/50 text-white"
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-display text-lg tracking-wide uppercase truncate">
                  {player.username || "Unknown Worm"}
                </div>
                <div className="text-xs text-meadow uppercase font-bold">Veteran Slitherer</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display text-sunflower leading-none">{player.elo}</div>
                <div className="text-[10px] text-white/30 uppercase">ELO</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-white/5 text-[10px] text-center text-white/20 tracking-tighter uppercase font-display">
        The strongest worms survive the sun
      </div>
    </div>
  );
}
