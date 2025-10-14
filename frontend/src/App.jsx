// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Routes>
          <Route path="/lobby" element={<LobbyPage />} />
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
