import type { Color, PieceSymbol, Square } from "chess.js"

export type boardType = ({
    square: Square,
    type: PieceSymbol,
    color: Color
} | null)[][]