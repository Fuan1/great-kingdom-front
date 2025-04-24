'use client';

import { useState } from 'react';

type StoneType = null | 'black' | 'white' | 'neutrality';
type TerritoryType = null | 'black' | 'white' | 'neutrality';
type BorderType = null | 'top' | 'right' | 'bottom' | 'left';
type CellState = {
    stone: StoneType;
    territory: TerritoryType;
    border: BorderType;
    visited: boolean;
};

interface searchResult {
    meetBorder: boolean[];
    meetColor: boolean;
    blankCount: number;
    opponentColorCount: number;
}

function dfs(board: CellState[][], row: number, col: number, color: StoneType, result: searchResult) {
    if (board[row][col].territory !== null) return;

    if (board[row][col].stone !== null && board[row][col].stone === color) {
        return;
    }

    if (board[row][col].border !== null) {
        if (board[row][col].border === 'top') {
            result.meetBorder[0] = true;
        }
        if (board[row][col].border === 'right') {
            result.meetBorder[1] = true;
        }
        if (board[row][col].border === 'bottom') {
            result.meetBorder[2] = true;
        }
        if (board[row][col].border === 'left') {
            result.meetBorder[3] = true;
        }
        return;
    }

    if (board[row][col].visited) return;

    if (board[row][col].stone !== null && board[row][col].stone !== color) {
        result.meetColor = true;
        result.opponentColorCount++;
    } else {
        result.blankCount++;
    }

    board[row][col].visited = true;

    dfs(board, row - 1, col, color, result);
    dfs(board, row + 1, col, color, result);
    dfs(board, row, col - 1, color, result);
    dfs(board, row, col + 1, color, result);
}

function initSearchResult(): searchResult {
    return {
        meetBorder: [false, false, false, false],
        meetColor: false,
        blankCount: 0,
        opponentColorCount: 0,
    };
}
function checkTerritory(board: CellState[][], result: searchResult, currentPlayer: StoneType) {
    console.log(result);
    if (
        (result.meetBorder[0] && result.meetBorder[1] && result.meetBorder[2] && result.meetBorder[3]) ||
        result.meetColor
    ) {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                if (board[i][j].visited === true) {
                    board[i][j].visited = false;
                }
            }
        }
    } else {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                if (board[i][j].visited === true) {
                    board[i][j].territory = currentPlayer;
                    board[i][j].visited = false;
                }
            }
        }
    }
}

function checkCapture(result: searchResult) {
    if (result.opponentColorCount > 0 && result.blankCount === 0) {
        return true;
    }
    return false;
}
function checkWinner(board: CellState[][]) {
    for (let i = 1; i < 10; i++) {
        for (let j = 1; j < 10; j++) {
            if (board[i][j].territory === null && board[i][j].stone === null) {
                return null;
            }
        }
    }

    let blackCount = 0;
    let whiteCount = 0;

    for (let i = 1; i < 10; i++) {
        for (let j = 1; j < 10; j++) {
            if (board[i][j].territory === 'black') {
                blackCount++;
            } else if (board[i][j].territory === 'white') {
                whiteCount++;
            }
        }
    }

    console.log(blackCount, whiteCount);

    if (blackCount > whiteCount + 2.5) {
        return 'black';
    } else {
        return 'white';
    }
}

export function GameBoard() {
    const [board, setBoard] = useState<CellState[][]>(
        Array(11)
            .fill(null)
            .map(() =>
                Array(11)
                    .fill(null)
                    .map(() => ({
                        stone: null,
                        territory: null,
                        border: null,
                        visited: false,
                    }))
            )
    );

    for (let i = 0; i < 11; i++) {
        board[0][i].border = 'top';
        board[10][i].border = 'bottom';
        board[i][0].border = 'left';
        board[i][10].border = 'right';
    }
    board[5][5].stone = 'neutrality';
    board[5][5].territory = 'neutrality';

    // 현재 플레이어 턴 (흑돌 시작)
    const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');

    // 게임 승자
    const [winner, setWinner] = useState<StoneType>(null);

    // 셀 클릭 핸들러
    const handleCellClick = (row: number, col: number) => {
        // 게임이 끝났거나 이미 돌이 있는 경우 무시
        if (winner || board[row][col].stone !== null) return;

        // 영역에는 돌을 둘 수 없음
        if (board[row][col].territory !== null) return;

        // 새 보드 상태 생성
        const newBoard = JSON.parse(JSON.stringify(board));
        var result: searchResult = initSearchResult();
        newBoard[row][col].stone = currentPlayer;

        dfs(newBoard, row - 1, col, currentPlayer, result);
        checkTerritory(newBoard, result, currentPlayer);
        var isCapture = checkCapture(result);
        if (isCapture) {
            setWinner(currentPlayer);
        }
        result = initSearchResult();

        dfs(newBoard, row + 1, col, currentPlayer, result);
        checkTerritory(newBoard, result, currentPlayer);
        isCapture = checkCapture(result);
        if (isCapture) {
            setWinner(currentPlayer);
        }
        result = initSearchResult();

        dfs(newBoard, row, col - 1, currentPlayer, result);
        checkTerritory(newBoard, result, currentPlayer);
        isCapture = checkCapture(result);
        if (isCapture) {
            setWinner(currentPlayer);
        }
        result = initSearchResult();

        dfs(newBoard, row, col + 1, currentPlayer, result);
        isCapture = checkCapture(result);
        if (isCapture) {
            setWinner(currentPlayer);
        }
        checkTerritory(newBoard, result, currentPlayer);

        // 영역 계산
        setBoard(newBoard);

        const isWinner = checkWinner(newBoard);
        console.log(isWinner);
        if (isWinner) {
            setWinner(isWinner);
        }
        // 플레이어 턴 변경
        setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    };

    return (
        <div className="relative w-full h-full rounded-md overflow-hidden">
            {/* 바둑판 이미지 */}
            <img src="/grid-9x9.png" alt="9x9 게임 그리드" className="w-full h-full object-contain" />

            {/* 클릭 가능한 오버레이 그리드 */}
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-9 grid-rows-9">
                {board.slice(1, 10).map((row, rowIndex) =>
                    row.slice(1, 10).map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`
                relative cursor-pointer
                ${cell.territory === 'black' ? 'bg-black m-2 rounded-md' : ''}
                ${cell.territory === 'white' ? 'bg-white m-2 rounded-md' : ''}
                ${cell.visited === true ? 'bg-red-500' : ''}
              `}
                            onClick={() => handleCellClick(rowIndex + 1, colIndex + 1)}
                        >
                            {/* 돌 렌더링 */}
                            {cell.stone && (
                                <div
                                    className={`
                  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  w-4/5 h-4/5 rounded-full shadow-md
                  ${
                      cell.stone === 'black'
                          ? 'bg-black'
                          : cell.stone === 'white'
                          ? 'bg-white border border-gray-300'
                          : 'bg-gray-300'
                  }
                `}
                                ></div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* 현재 플레이어 턴 표시 */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-opacity-75 bg-gray-800 text-white rounded-md">
                {winner
                    ? `${winner === 'black' ? '흑돌' : '백돌'} 승리!`
                    : `${currentPlayer === 'black' ? '흑돌' : '백돌'} 차례`}
            </div>
        </div>
    );
}
