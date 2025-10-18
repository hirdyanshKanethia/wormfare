import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage"; // 1. Import the new page
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
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
