"use client";

import { useEffect, useState } from "react";
import {
    CellState,
    ColorType,
    GameState,
    PlayerType,
    searchResult,
    StoneType,
    WinnerType,
} from "@/types/Game";
import { useChessSocket } from "@/api/socket/client";
import { useGameStore } from "@/store";

function dfs(
    board: CellState[][],
    row: number,
    col: number,
    color: StoneType,
    result: searchResult
) {
    if (board[row][col].territory !== null) return;

    if (board[row][col].stone !== null && board[row][col].stone === color) {
        return;
    }

    if (board[row][col].border !== null) {
        if (board[row][col].border === "top") {
            result.meetBorder[0] = true;
        }
        if (board[row][col].border === "right") {
            result.meetBorder[1] = true;
        }
        if (board[row][col].border === "bottom") {
            result.meetBorder[2] = true;
        }
        if (board[row][col].border === "left") {
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
function checkTerritory(
    board: CellState[][],
    result: searchResult,
    currentPlayer: StoneType
) {
    console.log(result);
    if (
        (result.meetBorder[0] &&
            result.meetBorder[1] &&
            result.meetBorder[2] &&
            result.meetBorder[3]) ||
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
            if (board[i][j].territory === "black") {
                blackCount++;
            } else if (board[i][j].territory === "white") {
                whiteCount++;
            }
        }
    }

    console.log(blackCount, whiteCount);

    if (blackCount > whiteCount + 2.5) {
        return "black";
    } else {
        return "white";
    }
}

export function GameBoard() {
    const currentGame = useGameStore((state) => state.currentGame);
    const { makeMove } = useChessSocket();
    const [board, setBoard] = useState<CellState[][]>(currentGame?.board || []);

    // 현재 플레이어 턴 (흑돌 시작)
    const [currentPlayer, setCurrentPlayer] = useState<PlayerType>(
        currentGame?.currentTurn || ColorType.BLACK
    );
    // 게임 승자
    const [winner, setWinner] = useState<WinnerType>(
        currentGame?.winner || null
    );

    // currentGame이 변경될 때 board, currentPlayer, winner 상태 업데이트
    useEffect(() => {
        if (currentGame) {
            setBoard(currentGame.board);
            setCurrentPlayer(currentGame.currentTurn);
            setWinner(currentGame.winner);
        }
    }, [currentGame]);

    const handleMakeMove = async (row: number, col: number) => {
        try {
            if (currentGame) {
                await makeMove(currentGame.gameId, row, col);
            }
        } catch (err) {
            console.error("게임 생성 오류:", err);
        }
    };

    return (
        <div className="relative w-full h-full rounded-md overflow-hidden">
            {/* 바둑판 이미지 */}
            <img
                src="/grid-9x9.png"
                alt="9x9 게임 그리드"
                className="w-full h-full object-contain"
            />

            {/* 클릭 가능한 오버레이 그리드 */}
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-9 grid-rows-9">
                {board.slice(1, 10).map((row, rowIndex) =>
                    row.slice(1, 10).map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`
                relative cursor-pointer
                ${cell.territory === "black" ? "bg-black m-2 rounded-md" : ""}
                ${cell.territory === "white" ? "bg-white m-2 rounded-md" : ""}
                ${cell.visited === true ? "bg-red-500" : ""}
              `}
                            onClick={() =>
                                handleMakeMove(rowIndex + 1, colIndex + 1)
                            }
                        >
                            {/* 돌 렌더링 */}
                            {cell.stone && (
                                <div
                                    className={`
                  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  w-4/5 h-4/5 rounded-full shadow-md
                  ${
                      cell.stone === "black"
                          ? "bg-black"
                          : cell.stone === "white"
                          ? "bg-white border border-gray-300"
                          : "bg-gray-300"
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
                    ? `${winner === "black" ? "흑돌" : "백돌"} 승리!`
                    : `${currentPlayer === "black" ? "흑돌" : "백돌"} 차례`}
            </div>
        </div>
    );
}
