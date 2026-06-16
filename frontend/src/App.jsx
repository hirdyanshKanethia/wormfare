import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { MultiBackend, TouchTransition } from "react-dnd-multi-backend";

import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

// Manual MultiBackend configuration for maximum stability
const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

function App() {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <BrowserRouter>

        <Routes>
          {/* Landing Page (Path: /) */}
          <Route
            path="/"
            element={
              <GuestRoute>
                <LandingPage />
              </GuestRoute>
            }
          />

          {/* Auth Page (Path: /auth) */}
          <Route
            path="/auth"
            element={
              <GuestRoute>
                <AuthPage />
              </GuestRoute>
            }
          />

          {/* Lobby Page (Path: /lobby) */}
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <LobbyPage />
              </ProtectedRoute>
            }
          />

          {/* Game Page (Path: /game) */}
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </DndProvider>
  );
}

export default App;
