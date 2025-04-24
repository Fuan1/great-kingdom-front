'use client';

import { useChessSocket } from '@/api/socket/client';
import { useEffect, useState } from 'react';

export default function Home() {
    const { status, error, currentGame, gameList, createGame, joinGame, makeMove, getGameList } = useChessSocket();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 컴포넌트 마운트 시 게임 목록 가져오기
        if (status === 'connected') {
            console.log('게임 목록 가져오기');
            getGameList().catch((err) => console.error('게임 목록 가져오기 실패:', err));
        }
    }, [status, getGameList]);

    const handleCreateGame = async () => {
        setLoading(true);
        try {
            const gameId = await createGame({
                timeLimit: 300, // 5분
                increment: 3,
                variant: 'standard',
            });
            console.log('생성된 게임 ID:', gameId);
        } catch (err) {
            console.error('게임 생성 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async (gameId: string) => {
        setLoading(true);
        try {
            await joinGame(gameId);
        } catch (err) {
            console.error('게임 참가 오류:', err);
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
                    <button onClick={handleCreateGame} disabled={loading || status !== 'connected'}>
                        새 게임 생성
                    </button>

                    <h2>게임 목록</h2>
                    {gameList.length > 0 ? (
                        <ul className="game-list">
                            {gameList.map((game) => (
                                <li key={game.id}>
                                    <button onClick={() => handleJoinGame(game.id)} disabled={loading}>
                                        게임 #{game.id.substring(0, 8)} 참가
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
                    <h2>게임 ID: {currentGame.id.substring(0, 8)}</h2>
                    {/* 여기에 게임 보드와 컨트롤 렌더링 */}
                </div>
            )}
        </div>
    );
}
