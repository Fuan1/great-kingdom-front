import { useGameStore, useUserStore } from '@/store';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimeBoxProps {
    opponentSide: boolean;
}

function formatTime(time: number): string {
    return `${Math.floor(time / 1000 / 60)}:${String(Math.floor((time / 1000) % 60)).padStart(2, '0')}`;
}

export function TimeBox({ opponentSide }: TimeBoxProps) {
    const currentGame = useGameStore((state) => state.currentGame);
    const user = useUserStore((state) => state.user);
    const DEFAULT_TIME = 5 * 60 * 1000; // 5분을 밀리초로 표현

    // 현재 플레이어 찾기 함수
    const getCurrentPlayer = () => {
        if (!currentGame?.players || !user) return null;
        return opponentSide
            ? currentGame.players.find((player) => player.id !== user.id)
            : currentGame.players.find((player) => player.id === user.id);
    };

    const currentPlayer = getCurrentPlayer();
    const [timer, setTimer] = useState<number>(currentPlayer?.time ?? DEFAULT_TIME);
    const id = currentPlayer?.id;

    useEffect(() => {
        const player = getCurrentPlayer();
        const time = player?.id === currentGame?.currentPlayer.id ? currentGame?.currentPlayer.time : player?.time;
        setTimer(time ?? DEFAULT_TIME);
    }, [currentGame]);

    return (
        <div
            className={`flex flex-row min-w-36 items-center justify-between border-2 ${
                currentGame?.currentPlayer.id === id ? 'border-zinc-300' : 'border-zinc-700'
            } rounded-md px-2 py-1 gap-x-2`}
        >
            <Clock className="w-6 h-6" />
            <div className="text-2xl font-bold">{formatTime(timer)}</div>
        </div>
    );
}
