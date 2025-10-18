import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-2xl">
        <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-wider">
          WORMFARE
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10">
          Engage in tactical garden warfare. Command your army of worms,
          outsmart your opponent, and claim victory in this strategic grid-based
          battle.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auth"
            className="px-10 py-4 bg-green-600 text-white font-bold rounded-lg text-2xl hover:bg-green-700 transition-all transform hover:scale-105"
          >
            Login / Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
