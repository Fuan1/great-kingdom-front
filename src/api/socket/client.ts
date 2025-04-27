import { io } from "socket.io-client";
import { useCallback, useEffect } from "react";
import { GameState } from "@/types/Game";
import { useGameStore, useSocketStore } from "@/store";

// 타입 정의 개선
interface GameOptions {
    timeLimit?: number;
    increment?: number;
    variant?: string;
}

interface GameMove {
    from: string;
    to: string;
    promotion?: string;
}

interface Game {
    game_id: string;
    // id: string;
    // players?: string[];
    // options?: GameOptions;
    // state?: GameState;
}

interface ResponseData {
    gameId?: string;
    gameState?: GameState;
    message?: string;
    gameList?: Game[];
}

interface GameEventResponse {
    event?: string;
    data?: ResponseData;
    gameState?: GameState;
    gameId?: string;
    message?: string;
    gameList?: any[];
}

export const useChessSocket = () => {
    const { currentGame, setCurrentGame, setGameList } = useGameStore();
    const { socket, status, error, setSocket, setStatus, setError } =
        useSocketStore();

    useEffect(() => {
        const socketInstance = io(
            process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080",
            {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ["websocket"],
            }
        );

        setSocket(socketInstance);
        setStatus("connecting");

        socketInstance.on("connect", () => {
            console.log("connected server. socket ID : ", socketInstance.id);
            setStatus("connected");
            setError(null);
        });

        socketInstance.on("connect_error", (err: Error) => {
            console.error("connect-error :", err.message);
            setStatus("error");
            setError(err.message);
        });

        socketInstance.io.on("error", (err: Error) => {
            console.log("Socket.io error detail information :", err);
            setError(err.message);
        });

        socketInstance.on("gameList", (response: GameEventResponse) => {
            if (response && response.gameList) {
                setGameList(response.gameList);
            }
        });

        socketInstance.on("gameEvent", (response: any) => {
            if (response && response.payload.gameState) {
                setCurrentGame(response.payload.gameState);
            }
        });

        return () => {
            socketInstance.disconnect();
            setStatus("disconnected");
        };
    }, [setSocket, setStatus, setError, setGameList, setCurrentGame]);

    const createGame = useCallback(
        async (
            options: GameOptions = {
                timeLimit: 600,
                increment: 5,
                variant: "standard",
            }
        ) => {
            if (!socket || status !== "connected")
                return Promise.reject("socket is not connected");

            return new Promise<string>((resolve, reject) => {
                socket.once("gameCreated", (response: GameEventResponse) => {
                    if (response && response.gameId) {
                        console.log(`game ID: ${response.gameId} created`);
                        resolve(response.gameId);
                    } else {
                        reject("invalid game creation response");
                    }
                });

                socket.emit(
                    "createGame",
                    options,
                    (response: GameEventResponse) => {
                        if (!response || response.event !== "gameCreated") {
                            reject(
                                response?.message || "failed to create game"
                            );
                        }
                    }
                );
            });
        },
        [socket, status, setCurrentGame]
    );

    const joinGame = useCallback(
        (gameId: string) => {
            if (!socket || status !== "connected")
                return Promise.reject("socket is not connected");

            return new Promise<GameState>((resolve, reject) => {
                socket.once("joinedGame", (response: GameEventResponse) => {
                    if (response && response.gameState) {
                        setCurrentGame(response.gameState);
                        resolve(response.gameState);
                    } else {
                        reject("invalid game join response");
                    }
                });

                socket.emit(
                    "joinGame",
                    { gameId },
                    (response: GameEventResponse) => {
                        if (!response || response.event !== "joinedGame") {
                            reject(response?.message || "failed to join game");
                        }
                    }
                );
            });
        },
        [socket, status, setCurrentGame]
    );

    const makeMove = useCallback(
        (gameId: string, x: number, y: number) => {
            if (!socket || status !== "connected")
                return Promise.reject("socket is not connected");

            return new Promise<GameState>((resolve, reject) => {
                socket.on("moveMade", (response: GameEventResponse) => {
                    if (response && response.gameState) {
                        // Zustand로 상태 관리 - 이미 gameEvent에서 업데이트됨
                        resolve(response.gameState);
                    } else {
                        reject("invalid move response");
                    }
                });

                socket.emit(
                    "makeMove",
                    {
                        gameId,
                        move: { playerId: socket.id, position: { x: x, y: y } },
                    },
                    (response: GameEventResponse) => {
                        if (response && response.event === "error") {
                            reject(response.message || "failed to make move");
                        }
                    }
                );
            });
        },
        [socket, status]
    );

    const getGameList = useCallback(() => {
        if (!socket || status !== "connected")
            return Promise.reject("socket is not connected");

        return new Promise<Game[]>((resolve, reject) => {
            // 이벤트 방식 사용
            const gameListHandler = (response: GameEventResponse) => {
                if (response && response.gameList) {
                    const games = response.gameList;
                    setGameList(games);
                    resolve(games);
                    socket.off("gameList", gameListHandler);
                }
            };

            // 타임아웃 설정
            const timeoutId = setTimeout(() => {
                console.error("getGameList response timeout");
                socket.off("gameList", gameListHandler);
                reject("no response from server");
            }, 5000);

            // 'gameList' event listener registration
            socket.on("gameList", gameListHandler);

            // emit event only
            socket.emit("getGameList");

            // cleanup function
            return () => {
                clearTimeout(timeoutId);
                socket.off("gameList", gameListHandler);
            };
        });
    }, [socket, status, setGameList]);

    const leaveGame = useCallback(
        (gameId: string) => {
            if (!socket || status !== "connected")
                return Promise.reject("소켓이 연결되지 않았습니다");

            return new Promise<boolean>((resolve, reject) => {
                socket.emit(
                    "leaveGame",
                    { gameId },
                    (response: GameEventResponse) => {
                        if (response && response.event === "leftGame") {
                            if (currentGame && currentGame.gameId === gameId) {
                                setCurrentGame(null);
                            }
                            resolve(true);
                        } else {
                            reject("게임을 나가는데 실패했습니다");
                        }
                    }
                );
            });
        },
        [socket, status, currentGame, setCurrentGame]
    );

    const connect = useCallback(() => {
        if (socket) {
            socket.connect();
            setStatus("connecting");
        }
    }, [socket, setStatus]);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            setStatus("disconnected");
        }
    }, [socket, setStatus]);

    return {
        socket,
        status,
        error,
        gameList: useGameStore((state) => state.gameList),
        currentGame,
        createGame,
        joinGame,
        makeMove,
        getGameList,
        leaveGame,
        connect,
        disconnect,
    };
};
