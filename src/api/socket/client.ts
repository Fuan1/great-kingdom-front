import { io, Socket } from 'socket.io-client';
import { useState, useEffect, useCallback } from 'react';

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

interface GameState {
    board?: string;
    fen?: string;
    turn?: string;
    status?: string;
    moveHistory?: string[];
    // 필요한 다른 게임 상태 속성들
}

interface Game {
    id: string;
    players?: string[];
    options?: GameOptions;
    state?: GameState;
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
    gameId?: string;
    message?: string;
    gameList?: any[];
}

// 소켓 연결 상태 관리를 위한 타입
type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useChessSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<SocketStatus>('disconnected');
    const [error, setError] = useState<string | null>(null);
    const [gameList, setGameList] = useState<Game[]>([]);
    const [currentGame, setCurrentGame] = useState<Game | null>(null);

    // 소켓 연결 초기화
    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket'],
        });

        setSocket(socketInstance);
        setStatus('connecting');

        // 소켓 이벤트 리스너 설정
        socketInstance.on('connect', () => {
            console.log('서버에 연결되었습니다. 소켓 ID:', socketInstance.id);
            setStatus('connected');
            setError(null);
        });

        socketInstance.on('connect_error', (err: Error) => {
            console.error('연결 오류:', err.message);
            setStatus('error');
            setError(err.message);
        });

        socketInstance.io.on('error', (err: Error) => {
            console.log('Socket.io 오류 상세 정보:', err);
            setError(err.message);
        });

        // 게임 관련 이벤트 리스너
        socketInstance.on('gameList', (response: GameEventResponse) => {
            if (response && response.data && response.data.gameList) {
                setGameList(response.data.gameList);
            }
        });

        socketInstance.on('gameState', (response: GameEventResponse) => {
            if (response && response.data && response.data.gameState && currentGame) {
                setCurrentGame({
                    ...currentGame,
                    state: response.data.gameState,
                });
            }
        });

        // 컴포넌트 언마운트 시 소켓 연결 정리
        return () => {
            socketInstance.disconnect();
            setStatus('disconnected');
        };
    }, []);

    // 게임 생성 함수
    const createGame = useCallback(
        (
            options: GameOptions = {
                timeLimit: 600,
                increment: 5,
                variant: 'standard',
            }
        ) => {
            if (!socket || status !== 'connected') return Promise.reject('소켓이 연결되지 않았습니다');

            return new Promise<string>((resolve, reject) => {
                // 일회성 이벤트 리스너 등록
                socket.once('gameCreated', (response: GameEventResponse) => {
                    if (response && response.data && response.data.gameId) {
                        console.log(`게임 ID: ${response.data.gameId} 생성됨`);
                        setCurrentGame({
                            id: response.data.gameId,
                            options,
                        });
                        resolve(response.data.gameId);
                    } else {
                        reject('게임 생성 응답이 유효하지 않습니다');
                    }
                });

                socket.emit('createGame', options, (response: GameEventResponse) => {
                    // 콜백에서는 오류 처리만 (성공은 이벤트로 처리)
                    if (!response || response.event !== 'gameCreated') {
                        reject(response?.message || '게임 생성에 실패했습니다');
                    }
                });
            });
        },
        [socket, status]
    );

    // 게임 참가 함수
    const joinGame = useCallback(
        (gameId: string) => {
            if (!socket || status !== 'connected') return Promise.reject('소켓이 연결되지 않았습니다');

            return new Promise<GameState>((resolve, reject) => {
                socket.once('joinedGame', (response: GameEventResponse) => {
                    if (response && response.data && response.data.gameState) {
                        console.log('이벤트: 게임 상태:', response.data.gameState);
                        setCurrentGame({
                            id: gameId,
                            state: response.data.gameState,
                        });
                        resolve(response.data.gameState);
                    } else {
                        reject('게임 참가 응답이 유효하지 않습니다');
                    }
                });

                socket.emit('joinGame', { gameId }, (response: GameEventResponse) => {
                    if (!response || response.event !== 'joinedGame') {
                        reject(response?.message || '게임 참가에 실패했습니다');
                    }
                });
            });
        },
        [socket, status]
    );

    // 게임 움직임 함수
    const makeMove = useCallback(
        (gameId: string, from: string, to: string, promotion?: string) => {
            if (!socket || status !== 'connected') return Promise.reject('소켓이 연결되지 않았습니다');

            const move = { from, to, promotion };

            return new Promise<GameState>((resolve, reject) => {
                socket.once('moveMade', (response: GameEventResponse) => {
                    if (response && response.data && response.data.gameState) {
                        console.log('움직임 업데이트:', response.data.gameState);
                        if (currentGame) {
                            setCurrentGame({
                                ...currentGame,
                                state: response.data.gameState,
                            });
                        }
                        resolve(response.data.gameState);
                    } else {
                        reject('움직임 응답이 유효하지 않습니다');
                    }
                });

                socket.emit('makeMove', { gameId, move }, (response: GameEventResponse) => {
                    if (response && response.event === 'error') {
                        reject(response.message || '움직임 수행에 실패했습니다');
                    }
                });
            });
        },
        [socket, status, currentGame]
    );

    // 게임 목록 조회 함수
    const getGameList = useCallback(() => {
        if (!socket || status !== 'connected') {
            console.error('소켓 연결 상태:', status, '소켓 객체:', !!socket);
            return Promise.reject('소켓이 연결되지 않았습니다');
        }

        console.log('소켓 연결 상태:', status, '소켓 ID:', socket.id);

        return new Promise<Game[]>((resolve, reject) => {
            // 이벤트 방식 사용
            const gameListHandler = (response: GameEventResponse) => {
                console.log('게임 목록 이벤트 수신:', response);
                if (response && response.data && response.data.gameList) {
                    const games = response.data.gameList;
                    setGameList(games);
                    resolve(games);
                    // 이벤트 리스너 제거
                    socket.off('gameList', gameListHandler);
                }
            };

            // 타임아웃 설정
            const timeoutId = setTimeout(() => {
                console.error('getGameList 응답 타임아웃');
                socket.off('gameList', gameListHandler);
                reject('서버로부터 응답이 없습니다');
            }, 5000);

            // 'gameList' 이벤트 리스너 등록
            socket.on('gameList', gameListHandler);

            // 단순히 이벤트만 발생시키고 콜백은 사용하지 않음
            socket.emit('getGameList');

            // 클린업 함수
            return () => {
                clearTimeout(timeoutId);
                socket.off('gameList', gameListHandler);
            };
        });
    }, [socket, status]);

    // 게임 상태 조회 함수
    const getGameState = useCallback(
        (gameId: string) => {
            if (!socket || status !== 'connected') return Promise.reject('소켓이 연결되지 않았습니다');

            return new Promise<GameState>((resolve, reject) => {
                socket.emit('getGameState', { gameId }, (response: GameEventResponse) => {
                    if (response && response.event === 'gameState' && response.data && response.data.gameState) {
                        resolve(response.data.gameState);
                        if (currentGame && currentGame.id === gameId) {
                            setCurrentGame({
                                ...currentGame,
                                state: response.data.gameState,
                            });
                        }
                    } else {
                        reject('게임 상태를 가져오는데 실패했습니다');
                    }
                });
            });
        },
        [socket, status, currentGame]
    );

    // 게임 나가기 함수
    const leaveGame = useCallback(
        (gameId: string) => {
            if (!socket || status !== 'connected') return Promise.reject('소켓이 연결되지 않았습니다');

            return new Promise<boolean>((resolve, reject) => {
                socket.emit('leaveGame', { gameId }, (response: GameEventResponse) => {
                    if (response && response.event === 'leftGame') {
                        if (currentGame && currentGame.id === gameId) {
                            setCurrentGame(null);
                        }
                        resolve(true);
                    } else {
                        reject('게임을 나가는데 실패했습니다');
                    }
                });
            });
        },
        [socket, status, currentGame]
    );

    // 연결 상태 관리 함수
    const connect = useCallback(() => {
        if (socket) {
            socket.connect();
            setStatus('connecting');
        }
    }, [socket]);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            setStatus('disconnected');
        }
    }, [socket]);

    return {
        socket,
        status,
        error,
        gameList,
        currentGame,
        createGame,
        joinGame,
        makeMove,
        getGameList,
        getGameState,
        leaveGame,
        connect,
        disconnect,
    };
};

// 단일 인스턴스가 필요할 경우를 위한 클래스 버전도 제공
export class ChessSocketClient {
    private static instance: ChessSocketClient;
    private socket: Socket | null = null;

    private constructor() {
        // 싱글톤
    }

    public static getInstance(): ChessSocketClient {
        if (!ChessSocketClient.instance) {
            ChessSocketClient.instance = new ChessSocketClient();
        }
        return ChessSocketClient.instance;
    }

    public connect(): Socket {
        if (!this.socket) {
            this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080', {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket'],
            });

            // 기본 이벤트 리스너 설정
            this.socket.on('connect', () => {
                console.log('서버에 연결되었습니다. 소켓 ID:', this.socket?.id);
            });

            this.socket.on('connect_error', (error: Error) => {
                console.error('연결 오류:', error.message);
            });
        }

        return this.socket;
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // 다른 메서드들은 필요에 따라 추가...
}
