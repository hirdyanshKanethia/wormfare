import { create } from "zustand";
import { useSocketStore } from "./socketStore";

const createEmptyBoard = () =>
  Array.from({ length: 8 }, () => Array(8).fill(0));

const INITIAL_ARMY = [
  { id: 1, name: "General C. Crawlington", length: 5 },
  { id: 2, name: "Major Slitherford", length: 4 },
  { id: 3, name: "Captain Coilton", length: 3 },
  { id: 4, name: "Sarge Wiggles", length: 3 },
  { id: 5, name: "Private Squirmley", length: 2 },
];

const initialState = {
  gamePhase: "lobby",
  playerID: null,
  activeTurn: null, // will be 0 or 1
  winner: null,
  gameResult: null, // "win", "lose", or "draw"
  army: [],
  placements: {},
  playerBoard: createEmptyBoard(),
  opponentBoard: createEmptyBoard(),
};

export const useGameStore = create((set, get) => ({
  ...initialState,
  cellSize: 48,

  // --- ACTIONS ---

  setCellSize: (size) => set({ cellSize: size }),
  findMatch: () => set({ gamePhase: "waiting" }),

  setGamePhase: (phase) => set({ gamePhase: phase }),

  startGame: (payload) => {
    set({
      gamePhase: "placing_worms",
      playerID: payload.playerID,
      army: INITIAL_ARMY.map((w) => ({ ...w })),
      placements: {},
      playerBoard: createEmptyBoard(),
      opponentBoard: createEmptyBoard(),
    });
  },

  placeWorm: (worm, x, y, orientation = "vertical") => {
    set((state) => {
      const newBoard = state.playerBoard.map((row) => [...row]);
      const newCoords = [];
      for (let i = 0; i < worm.length; i++) {
        let newX = x;
        let newY = y;
        if (orientation === "horizontal") newX += i;
        else newY += i;

        if (
          newX < 0 ||
          newX > 7 ||
          newY < 0 ||
          newY > 7 ||
          newBoard[newY][newX] < 0
        ) {
          return state; // Abort
        }
        newCoords.push({ x: newX, y: newY });
      }

      newCoords.forEach((coord) => (newBoard[coord.y][coord.x] = -worm.id));
      const newPlacements = {
        ...state.placements,
        [worm.id]: { wormType: worm.name, wormId: worm.id, x, y, orientation },
      };
      return { playerBoard: newBoard, placements: newPlacements };
    });
  },

  moveWorm: (worm, newX, newY) => {
    set((state) => {
      const { placements, playerBoard, army } = state;
      const oldPlacement = placements[worm.id];
      if (!oldPlacement) return state; // Worm wasn't placed, do nothing

      const orientation = oldPlacement.orientation; // Keep the same orientation

      // 1. Create a clean board copy with the worm removed from its old spot
      const boardWithoutWorm = playerBoard.map((row) => [...row]);
      for (let i = 0; i < worm.length; i++) {
        if (orientation === "horizontal") {
          boardWithoutWorm[oldPlacement.y][oldPlacement.x + i] = 0;
        } else {
          boardWithoutWorm[oldPlacement.y + i][oldPlacement.x] = 0;
        }
      }

      // 2. Validate the new position on the cleared board
      for (let i = 0; i < worm.length; i++) {
        let currentX = newX;
        let currentY = newY;
        if (orientation === "horizontal") currentX += i;
        else currentY += i;

        if (
          currentX < 0 ||
          currentX > 7 ||
          currentY < 0 ||
          currentY > 7 ||
          boardWithoutWorm[currentY][currentX] < 0
        ) {
          console.error("Cannot move: Invalid new position.");
          return state; // Abort the move if invalid
        }
      }

      // 3. If valid, place the worm in its new position
      const newBoard = boardWithoutWorm;
      for (let i = 0; i < worm.length; i++) {
        if (orientation === "horizontal") {
          newBoard[newY][newX + i] = -worm.id;
        } else {
          newBoard[newY + i][newX] = -worm.id;
        }
      }

      // 4. Update the placements map with the new coordinates
      const newPlacements = {
        ...placements,
        [worm.id]: { ...oldPlacement, x: newX, y: newY },
      };

      return { playerBoard: newBoard, placements: newPlacements };
    });
  },

  /**
   * Rotates a worm that is already on the board.
   */
  rotateWorm: (wormId) => {
    set((state) => {
      const { placements, playerBoard, army } = state;
      const currentPlacement = placements[wormId];
      const worm = army.find((w) => w.id === wormId);
      if (!currentPlacement || !worm) return state;

      // Create a clean board copy with the worm removed
      const boardWithoutWorm = playerBoard.map((row) => [...row]);
      for (let i = 0; i < worm.length; i++) {
        if (currentPlacement.orientation === "horizontal")
          boardWithoutWorm[currentPlacement.y][currentPlacement.x + i] = 0;
        else boardWithoutWorm[currentPlacement.y + i][currentPlacement.x] = 0;
      }

      // Validate the new rotated position
      const newOrientation =
        currentPlacement.orientation === "horizontal"
          ? "vertical"
          : "horizontal";
      for (let i = 0; i < worm.length; i++) {
        let newX = currentPlacement.x;
        let newY = currentPlacement.y;
        if (newOrientation === "horizontal") newX += i;
        else newY += i;
        if (
          newX < 0 ||
          newX > 7 ||
          newY < 0 ||
          newY > 7 ||
          boardWithoutWorm[newY][newX] < 0
        ) {
          return state; // Abort if invalid
        }
      }

      // If valid, place the worm in its new rotated position
      for (let i = 0; i < worm.length; i++) {
        if (newOrientation === "horizontal")
          boardWithoutWorm[currentPlacement.y][currentPlacement.x + i] =
            -wormId;
        else
          boardWithoutWorm[currentPlacement.y + i][currentPlacement.x] =
            -wormId;
      }

      const newPlacements = {
        ...placements,
        [wormId]: { ...currentPlacement, orientation: newOrientation },
      };
      return { playerBoard: boardWithoutWorm, placements: newPlacements };
    });
  },

  /**
   * Un-places a worm from the board, returning it to the dock.
   */
  unplaceWorm: (wormId) => {
    set((state) => {
      const { placements, playerBoard, army } = state;
      const placementToRemove = placements[wormId];
      if (!placementToRemove) return state;

      const newBoard = playerBoard.map((row) => [...row]);
      const worm = army.find((w) => w.id === wormId);
      for (let i = 0; i < worm.length; i++) {
        if (placementToRemove.orientation === "horizontal")
          newBoard[placementToRemove.y][placementToRemove.x + i] = 0;
        else newBoard[placementToRemove.y + i][placementToRemove.x] = 0;
      }

      const newPlacements = { ...placements };
      delete newPlacements[wormId];

      return { playerBoard: newBoard, placements: newPlacements };
    });
  },

  /**
   * Sends the final worm placements to the backend server.
   */
  confirmPlacements: () => {
    const { placements, playerBoard } = get();
    const sendMessage = useSocketStore.getState().sendMessage;

    set({ playerBoard: playerBoard });

    const payload = Object.values(placements).map(({ wormId, ...rest }) => {
      return rest;
    });

    sendMessage({
      type: "game.place_worms",
      payload: payload,
    });

    console.log(payload);
  },

  reset: () => {
    set(initialState);
  },

  battleStart: (payload) => {
    set({
      gamePhase: "playing",
      activeTurn: payload.turn,
    });
  },

  fireShot: (x, y) => {
    const { activeTurn, playerID } = get();
    if (activeTurn !== playerID) {
      console.warn("Not your turn!");
      return;
    }

    const { sendMessage } = useSocketStore.getState();
    sendMessage({
      type: "game.fire_shot",
      payload: { x, y },
    });
  },

  handleFireResult: (payload) => {
    set((state) => {
      const { x, y, result, actingPlayer } = payload;
      // Determine which board to update
      const boardToUpdate =
        actingPlayer === state.playerID ? "opponentBoard" : "playerBoard";

      const newBoard = state[boardToUpdate].map((row) => [...row]);

      if (result === "miss") newBoard[y][x] = 1;
      if (result === "hit") newBoard[y][x] = 2;
      if (result === "killed") {
        payload.worm.positions.forEach((pos) => {
          newBoard[pos.y][pos.x] = 3;
        });
      }

      return { [boardToUpdate]: newBoard };
    });
  },

  handleTurnUpdate: (payload) => {
    set({ activeTurn: payload.turn });
  },

  handleGameOver: (payload) => {
    set({
      gamePhase: "game_over",
      winner: payload.winner,
      gameResult: payload.result,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
