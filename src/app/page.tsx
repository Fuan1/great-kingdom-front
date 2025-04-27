"use client";

import { useChessSocket } from "@/api/socket/client";
import { GameBoard } from "@/components/game-board";
import { NotationBox } from "@/components/notation-box";
import { PlayerProfileBadge } from "@/components/player-profile-badge";
import { TimeBox } from "@/components/time-box";
import { useGameStore, useSocketStore } from "@/store";
import { useEffect, useState } from "react";

export default function Home() {
    // Zustand 스토어에서 상태와 액션 가져오기
    const { currentGame } = useGameStore();
    const { status, error } = useSocketStore();

    // 소켓 기능은 여전히 훅에서 가져옴
    const { gameList, createGame, joinGame, getGameList } = useChessSocket();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 컴포넌트 마운트 시 게임 목록 가져오기
        if (status === "connected") {
            console.log("게임 목록 가져오기");
            getGameList().catch((err) =>
                console.error("게임 목록 가져오기 실패:", err)
            );
            console.log("game list :", gameList);
        }
    }, [status, getGameList]);

    const handleCreateGame = async () => {
        setLoading(true);
        try {
            await createGame({
                timeLimit: 300, // 5분
                increment: 3,
                variant: "standard",
            });
        } catch (err) {
            console.error("failed to create game", err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async (gameId: string) => {
        setLoading(true);
        try {
            await joinGame(gameId);
        } catch (err) {
            console.error("게임 참가 오류:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chess-game-container">
            <h1>체스 게임</h1>

            {error && <div className="error-message">오류: {error}</div>}

            <div className="connection-status">연결 상태: {status}</div>

            {!currentGame ? (
                <div className="game-lobby">
                    <button
                        onClick={handleCreateGame}
                        disabled={loading || status !== "connected"}
                    >
                        새 게임 생성
                    </button>

                    <h2>게임 목록</h2>
                    {gameList.length > 0 ? (
                        <ul className="game-list">
                            {gameList.map((game) => (
                                <li key={game}>
                                    <button
                                        onClick={() => handleJoinGame(game)}
                                        disabled={loading}
                                    >
                                        게임 #{game} 참가
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>사용 가능한 게임이 없습니다</p>
                    )}
                </div>
            ) : (
                <div className="active-game">
                    <h2>게임 ID: {currentGame.gameId}</h2>
                    {/* 여기에 게임 보드와 컨트롤 렌더링 */}
                    <main className="flex flex-row items-center max-h-screen justify-center max-w-screen-xl mx-auto p-4 gap-x-4">
                        {/* game board */}
                        <div className="h-full w-full flex flex-col gap-y-2">
                            <div className="flex flex-row items-center h-12 w-full">
                                <PlayerProfileBadge
                                    playerName="홍길동"
                                    score={1}
                                    rating={1850}
                                    countryCode="kr"
                                    isPremium={true}
                                />
                                <TimeBox />
                            </div>
                            <div className="flex-grow">
                                <GameBoard />
                            </div>
                            <div className="flex flex-row items-center h-12 w-full">
                                <PlayerProfileBadge
                                    playerName="Fuan"
                                    rating={1850}
                                    countryCode="kr"
                                    isPremium={true}
                                />
                                <TimeBox />
                            </div>
                        </div>
                        {/* game controls, chat */}
                        <div className="w-[40rem] h-full flex flex-col gap-x-2">
                            <div className="w-full h-2/3 ">
                                <NotationBox />
                            </div>
                            <div className="w-full h-1/3 bg-yellow-500"></div>
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
}
