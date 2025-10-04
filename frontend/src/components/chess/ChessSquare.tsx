"use client"

import type { Square } from "chess.js"

interface ChessSquareProps {
  square: any
  squareRepresentation: Square
  isLightSquare: boolean
  isCheckedKing: boolean
  isSelected: boolean
  playerColor: string
  onClick: (square: Square) => void
}

export function ChessSquare({
  square,
  squareRepresentation,
  isLightSquare,
  isCheckedKing,
  isSelected,
  playerColor,
  onClick,
}: ChessSquareProps) {
  return (
    <button
      onClick={() => onClick(squareRepresentation)}
      className={`
        w-10 h-10 sm:w-14 sm:h-14 md:w-[70px] md:h-[70px] lg:w-20 lg:h-20
        flex justify-center items-center
        transition-all duration-150
        relative
        ${isLightSquare ? "bg-amber-50" : "bg-amber-800"}
        ${isCheckedKing ? "!bg-red-500 animate-pulse" : ""}
        ${isSelected ? "ring-4 ring-inset ring-blue-500 !bg-blue-100" : ""}
        ${square && square.color === playerColor ? "hover:brightness-95 active:scale-95 cursor-pointer" : "cursor-default"}
      `}
    >
      {square ? (
        <img
          className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 pointer-events-none select-none drop-shadow-sm"
          src={`/${square.color === "b" ? square.type : `${square.type?.toUpperCase()} copy`}.png`}
          alt={`${square.color} ${square.type}`}
          draggable={false}
        />
      ) : null}
    </button>
  )
}
