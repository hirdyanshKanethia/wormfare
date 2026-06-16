import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { login, signUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signUp(email, password, username);
        setMessage("Check your dirt-mail for confirmation! 🐛");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-underground relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 w-full h-2 bg-meadow" />
      <div className="absolute bottom-0 w-full h-4 bg-clay shadow-[0_-10px_30px_rgba(160,82,45,0.2)]" />

      <Link 
        to="/" 
        className="absolute top-8 left-8 text-meadow hover:text-sunflower transition-colors flex items-center gap-2 font-display text-lg"
      >
        <span>⇠</span> BACK TO GARDEN
      </Link>

      <div className="garden-panel w-full max-w-md bg-clay/10 backdrop-blur-md">
        <h1 className="text-5xl text-center mb-8 text-sunflower">
          {isLoginView ? "Worm ID" : "New Recruit"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLoginView && (
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-display text-meadow ml-2">Codename</label>
              <input
                type="text"
                placeholder="The Slitherer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-4 bg-underground/50 rounded-2xl border-2 border-meadow/30 focus:border-sunflower outline-none transition-all text-white placeholder:text-white/20"
                required
              />
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-display text-meadow ml-2">Dirt-Mail</label>
            <input
              type="email"
              placeholder="worm@garden.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-4 bg-underground/50 rounded-2xl border-2 border-meadow/30 focus:border-sunflower outline-none transition-all text-white placeholder:text-white/20"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-display text-meadow ml-2">Secret Code</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-4 bg-underground/50 rounded-2xl border-2 border-meadow/30 focus:border-sunflower outline-none transition-all text-white placeholder:text-white/20"
              required
            />
          </div>

          <button type="submit" className="garden-btn mt-4 w-full">
            {isLoginView ? "SQUAD LOGIN" : "JOIN THE WAR"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-2xl text-red-300 text-sm text-center">
            ⚠️ {error}
          </div>
        )}
        
        {message && (
          <div className="mt-6 p-4 bg-meadow/20 border-2 border-meadow/50 rounded-2xl text-meadow text-sm text-center">
            ✨ {message}
          </div>
        )}

        <div className="mt-8 text-center border-t-2 border-white/5 pt-6">
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError("");
              setMessage("");
            }}
            className="text-white/40 hover:text-sunflower transition-colors font-display text-sm tracking-widest"
          >
            {isLoginView ? "WANT TO ENLIST? SIGN UP" : "ALREADY ENLISTED? LOGIN"}
          </button>
        </div>
      </div>

      {/* Small floating worms */}
      <div className="absolute top-1/4 right-10 text-4xl animate-bounce pointer-events-none opacity-20">🐛</div>
      <div className="absolute bottom-1/4 left-10 text-4xl animate-bounce delay-700 pointer-events-none opacity-20">🪱</div>
    </div>
  );
}
