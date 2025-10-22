import { create } from "zustand";
import { useGameStore } from "./gameStore";

export const useSocketStore = create((set, get) => ({
  socket: null,
  connectionStatus: "disconnected",

  connect: (token) => {
    if (get().socket || !token) return; // Prevent connecting without a token
    set({ connectionStatus: "connecting" });

    const socketURL =
      import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080/ws";
    const socket = new WebSocket(socketURL);

    socket.onopen = () => {
      set({ connectionStatus: "connected" });
      console.log("WebSocket connected. Sending auth token...");

      // **SEND AUTH MESSAGE HERE**: Immediately after connection opens.
      get().sendMessage({ type: "auth", payload: { token } });
    };

    socket.onclose = () => {
      set({ socket: null, connectionStatus: "disconnected" });
      // Reset game state on disconnect
      useGameStore.getState().reset();
    };
    socket.onerror = (error) => console.error("WebSocket Error:", error);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received:", message);

      const {
        startGame,
        setGamePhase,
        battleStart,
        handleFireResult,
        handleTurnUpdate,
        handleGameOver,
      } = useGameStore.getState();

      switch (message.type) {
        case "game.start":
          startGame(message.payload);
          break;

        case "game.placement_success":
          setGamePhase("waiting_for_opponent");
          break;

        case "game.battle_start":
          battleStart(message.payload);
          break;

        case "game.fire_result":
          handleFireResult(message.payload);
          break;
        case "game.turn_update":
          handleTurnUpdate(message.payload);
          break;
        case "game_over":
          handleGameOver(message.payload);
          break;
      }
    };

    set({ socket });
  },

  sendMessage: (message) => {
    get().socket?.send(JSON.stringify(message));
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
    }
  },
}));
