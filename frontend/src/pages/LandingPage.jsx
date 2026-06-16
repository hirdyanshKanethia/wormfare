import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Garden Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-meadow/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-worm-neon/5 rounded-full blur-3xl" />
      
      {/* Grass patches in corners */}
      <div className="absolute top-0 left-0 text-6xl opacity-20 transform -rotate-12 select-none pointer-events-none">🌿</div>
      <div className="absolute bottom-10 left-10 text-6xl opacity-20 transform rotate-45 select-none pointer-events-none">🐛</div>
      <div className="absolute top-20 right-10 text-6xl opacity-20 transform -rotate-45 select-none pointer-events-none">🌻</div>
      <div className="absolute bottom-0 right-0 text-7xl opacity-20 transform rotate-12 select-none pointer-events-none">🌿</div>

      <div className="max-w-4xl z-10 text-center">
        <div className="inline-block relative mb-6">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-display text-sunflower drop-shadow-[0_8px_0_#A0522D] animate-wiggle">
            WORMFARE
          </h1>
          <div className="absolute -top-6 -right-6 text-2xl md:text-4xl animate-bounce">⚔️</div>
        </div>

        <div className="garden-panel mb-12">
          <p className="text-xl md:text-3xl text-white/90 leading-relaxed font-light italic">
            "The garden wasn't big enough for both of us."
          </p>
          <p className="text-lg md:text-xl text-white/70 mt-4 max-w-2xl mx-auto">
            Command your elite slither-squad, master the mud, and unleash tactical 
            chaos in the ultimate underground grid-based showdown.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            to="/auth"
            className="garden-btn scale-110 hover:scale-125 transition-transform"
          >
            Enter the Garden
          </Link>
        </div>
        
        <div className="mt-16 flex gap-4 justify-center items-center text-white/40 font-display text-sm">
          <span>REAL-TIME SLITHERING</span>
          <span className="w-2 h-2 rounded-full bg-meadow" />
          <span>STRATEGIC MUD-PLAY</span>
          <span className="w-2 h-2 rounded-full bg-meadow" />
          <span>WORM SUPREMACY</span>
        </div>
      </div>
    </div>
  );
}
