import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";
import { useAuthStore } from "../store/authStore";
import Leaderboard from "../components/Leaderboard";

export default function LobbyPage() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const findMatch = useGameStore((state) => state.findMatch);
  const { connect } = useSocketStore();
  const { session, logout, user } = useAuthStore();

  const handleFindMatch = () => {
    const token = session?.access_token;
    if (!token) {
      alert("Enlistment expired. Please log in again.");
      return;
    }

    setIsConnecting(true);
    connect(token);
    findMatch();
    navigate("/game");
  };

  const username = user?.user_metadata?.username || "Unnamed Recruit";

  return (
    <div className="min-h-screen bg-underground p-8 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-meadow rounded-2xl flex items-center justify-center text-3xl shadow-[0_4px_0_0_#A0522D] animate-bounce">
            🪖
          </div>
          <div>
            <h2 className="text-xl text-meadow uppercase font-display leading-tight">Commander</h2>
            <h1 className="text-3xl text-white uppercase font-display leading-tight tracking-wide">{username}</h1>
          </div>
        </div>

        <button 
          onClick={logout}
          className="text-white/30 hover:text-red-400 font-display text-sm tracking-widest transition-colors cursor-pointer"
        >
          RETREAT (LOGOUT)
        </button>
      </div>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Call to Action Section */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="garden-panel flex-1 flex flex-col items-center justify-center text-center py-16 bg-white/5 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sunflower/20 rounded-full blur-[80px] group-hover:bg-sunflower/30 transition-all duration-700" />
            
            <div className="z-10">
              <h2 className="text-5xl text-white mb-6 uppercase">Ready for War?</h2>
              <p className="text-white/60 mb-12 max-w-md mx-auto text-lg">
                Enter the matchmaking queue to find an opponent and settle the garden 
                dispute once and for all.
              </p>
              
              <button 
                onClick={handleFindMatch} 
                disabled={isConnecting}
                className="garden-btn scale-125 hover:scale-150 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isConnecting ? "ENLISTING..." : "FIND A BATTLE"}
                <span className="ml-3 group-hover:rotate-12 inline-block transition-transform">⚔️</span>
              </button>
            </div>

            {/* Decorative icons */}
            <div className="absolute bottom-10 left-10 text-4xl opacity-10 group-hover:opacity-30 transition-opacity">🌿</div>
            <div className="absolute top-10 right-10 text-4xl opacity-10 group-hover:opacity-30 transition-opacity rotate-45">🌿</div>
          </div>

          {/* Quick Tips */}
          <div className="garden-panel bg-clay/5 border-white/10 flex items-center gap-6 py-6">
            <div className="text-4xl">💡</div>
            <div className="text-sm text-white/50 leading-relaxed italic">
              <strong>Tip:</strong> Earthworms have no lungs; they breathe through their skin. 
              In <strong>Wormfare</strong>, your skin needs to be thick to survive the incoming mud-fire!
            </div>
          </div>
        </div>

        {/* Sidebar: Leaderboard */}
        <div className="h-[600px] lg:h-auto">
          <Leaderboard />
        </div>
      </main>

      <footer className="mt-12 text-white/10 font-display text-[10px] tracking-[0.2em] uppercase text-center">
        Wormfare Global Command &copy; 2026 // No worms were actually harmed
      </footer>
    </div>
  );
}
