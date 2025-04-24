export function NotationBox() {
    // Individual moves coming from server subscription
    type MoveColor = 'black' | 'white';

    interface Move {
        number: number;
        color: MoveColor;
        move: string;
        time: string;
    }

    const sampleMoves: Move[] = [
        {
            number: 1,
            color: 'black',
            move: 'e4',
            time: '600',
        },
        {
            number: 1,
            color: 'white',
            move: 'e5',
            time: '600',
        },
        {
            number: 2,
            color: 'black',
            move: 'a3',
            time: '553',
        },
        {
            number: 2,
            color: 'white',
            move: 'b6',
            time: '553',
        },
        {
            number: 3,
            color: 'black',
            move: 'f3',
            time: '553',
        },
        {
            number: 3,
            color: 'white',
            move: 'f4',
            time: '553',
        },
        {
            number: 4,
            color: 'black',
            move: 'g1',
            time: '553',
        },
        {
            number: 4,
            color: 'white',
            move: 'g2',
            time: '553',
        },
    ];

    // Group moves by turn number
    const groupedMoves: { [key: number]: { [K in MoveColor]?: Move } } = {};

    sampleMoves.forEach((move) => {
        if (!groupedMoves[move.number]) {
            groupedMoves[move.number] = {};
        }
        groupedMoves[move.number][move.color] = move;
    });

    return (
        <ul className="h-full flex flex-col bg-zinc-800 rounded-t-md py-10">
            {Object.entries(groupedMoves).map(([number, moves]) => (
                <li
                    key={number}
                    className={`w-full flex flex-row items-center justify-between px-4 ${
                        parseInt(number) % 2 === 0 ? 'bg-zinc-700' : 'bg-zinc-800'
                    }`}
                >
                    <div className="font-medium text-sm">{number}.</div>
                    <div className="text-left min-w-16 text-sm">{moves.black?.move || '-'}</div>
                    <div className="text-left min-w-16 text-sm">{moves.white?.move || '-'}</div>
                    <div className="flex flex-col items-center justify-center gap-x-2">
                        <div className="flex items-center gap-1">
                            <div className="text-xs text-gray-500">{Number(moves.white?.time) / 10 || '-'}s</div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="text-xs text-gray-500">{Number(moves.black?.time) / 10 || '-'}s</div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
