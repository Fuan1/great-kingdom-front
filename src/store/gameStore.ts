import { create } from "zustand";
import { GameState } from "@/types/Game";

interface GameStore {
    // 상태
    currentGame: GameState | null;
    gameList: string[];

    // 액션
    setCurrentGame: (game: GameState | null) => void;
    setGameList: (games: string[]) => void;
    updateGameState: (gameState: GameState) => void;
    resetGame: () => void;
}

const useGameStore = create<GameStore>((set) => ({
    // 초기 상태
    currentGame: null,
    gameList: [],

    // 액션 정의
    setCurrentGame: (game) => set({ currentGame: game }),
    setGameList: (games) => set({ gameList: games }),
    updateGameState: (gameState) =>
        set((state) => ({
            currentGame: state.currentGame
                ? { ...state.currentGame, ...gameState }
                : gameState,
        })),
    resetGame: () => set({ currentGame: null }),
}));

export default useGameStore;
