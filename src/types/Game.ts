export enum ColorType {
    BLACK = 'black',
    WHITE = 'white',
    NEUTRALITY = 'neutrality',
}
export type WinnerType = null | ColorType.BLACK | ColorType.WHITE;
export type StoneType = null | ColorType;
export type TerritoryType = null | ColorType;
export type BorderType = null | 'top' | 'right' | 'bottom' | 'left';
export type CellState = {
    stone: StoneType;
    territory: TerritoryType;
    border: BorderType;
    visited: boolean;
};

export interface searchResult {
    meetBorder: boolean[];
    meetColor: boolean;
    blankCount: number;
    opponentColorCount: number;
}

export type Player = {
    id: string;
    color: ColorType | null;
    time: number;
};

export interface GameState {
    gameId: string;
    board: CellState[][];
    currentPlayer: Player;
    players: Player[];
    gameOver: boolean;
    gameIndex: number;
    winner: string | null;
    timer: number;
}
