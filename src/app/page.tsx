'use client';

import { useChessSocket } from '@/hooks/socket/client';
import { GameBoard } from '@/components/game-board';
import { NotationBox } from '@/components/notation-box';
import { PlayerProfileBadge } from '@/components/player-profile-badge';
import { TimeBox } from '@/components/time-box';
import { useGameStore, useSocketStore, useUserStore } from '@/store';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
    const { currentGame } = useGameStore();
    const { status, error } = useSocketStore();
    const { user, setUser } = useUserStore();

    const searchParams = useSearchParams();
    const userId = searchParams.get('user');

    const { gameList, createGame, joinGame, getGameList } = useChessSocket();

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        // 컴포넌트 마운트 시 게임 목록 가져오기
        if (status === 'connected') {
            console.log('게임 목록 가져오기');
            getGameList().catch((err) => console.error('게임 목록 가져오기 실패:', err));
            console.log('game list :', gameList);
        }
    }, [status, getGameList]);

    useEffect(() => {
        // 사용자 정보를 가져와서 store에 저장
        const fetchAndSetUser = async () => {
            try {
                setUser({
                    id: userId || '',
                    rating: 1234,
                });
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchAndSetUser();
    }, [setUser, userId]);

    const handleCreateGame = async () => {
        setLoading(true);
        try {
            await createGame({
                timeLimit: 300, // 5분
                increment: 3,
                variant: 'standard',
            });
        } catch (err) {
            console.error('failed to create game', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async (gameId: string) => {
        setLoading(true);
        try {
            const gameState = await joinGame(gameId);
            console.log('게임 참가 완료', gameState.gameId);
            // 게임 참가 후 페이지 이동
            if (gameState && gameState.gameId) {
                router.push(`/game/${gameState.gameId}?user=${user?.id}`);
            }
        } catch (err) {
            console.error('게임 참가 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chess-game-container">
            <h1>안녕하세요 {user?.id} 님 !</h1>

            {error && <div className="error-message">오류: {error}</div>}

            <div className="connection-status">연결 상태: {status}</div>

            <div className="game-lobby">
                <button onClick={handleCreateGame} disabled={loading || status !== 'connected'}>
                    새 게임 생성
                </button>

                <h2>게임 목록</h2>
                {gameList.length > 0 ? (
                    <ul className="game-list">
                        {gameList.map((game) => (
                            <li key={game}>
                                <button onClick={() => handleJoinGame(game)} disabled={loading}>
                                    게임 #{game} 참가
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>사용 가능한 게임이 없습니다</p>
                )}
            </div>
            <div className="active-game">
                <h2>게임 ID: {currentGame?.gameId}</h2>
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
                            <TimeBox opponentSide={true} />
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
                            <TimeBox opponentSide={false} />
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
        </div>
    );
}
