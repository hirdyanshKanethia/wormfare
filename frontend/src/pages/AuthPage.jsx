import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Add state for username
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
        // **THE FIX**: Pass username to signUp
        await signUp(email, password, username);
        setMessage("Success! Please check your email for a confirmation link.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-8">
        {isLoginView ? "Login" : "Sign Up"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        {/* **THE FIX**: Conditionally render the username input */}
        {!isLoginView && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <button
          type="submit"
          className="p-3 bg-green-600 font-bold rounded-md hover:bg-green-700"
        >
          {isLoginView ? "Login" : "Sign Up"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      {message && <p className="mt-4 text-green-400">{message}</p>}

      <button
        onClick={() => {
          setIsLoginView(!isLoginView);
          setError(""); // Clear errors when switching views
          setMessage("");
        }}
        className="mt-6 text-gray-400 hover:text-white"
      >
        {isLoginView
          ? "Need an account? Sign Up"
          : "Already have an account? Login"}
      </button>
    </div>
  );
}
