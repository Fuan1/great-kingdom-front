import { create } from "zustand";
import { Socket } from "socket.io-client";

// 소켓 연결 상태 관리를 위한 타입
type SocketStatus = "disconnected" | "connecting" | "connected" | "error";

interface SocketStore {
    // 상태
    socket: Socket | null;
    status: SocketStatus;
    error: string | null;

    // 액션
    setSocket: (socket: Socket | null) => void;
    setStatus: (status: SocketStatus) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const useSocketStore = create<SocketStore>((set) => ({
    // 초기 상태
    socket: null,
    status: "disconnected",
    error: null,

    // 액션 정의
    setSocket: (socket) => set({ socket }),
    setStatus: (status) => set({ status }),
    setError: (error) => set({ error }),
    reset: () => set({ socket: null, status: "disconnected", error: null }),
}));

export default useSocketStore;
