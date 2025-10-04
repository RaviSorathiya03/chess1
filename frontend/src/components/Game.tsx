"use client"

import type { Color, Square } from "chess.js"
import { useCallback, useEffect, useState } from "react"
import type { boardType } from "../types/board"

interface GameProps {
  board: boardType | null
  socket: WebSocket
  setBoard: (b: boardType) => void
  chess: any
  checkEvent: { color: string } | null
  invalidMove: boolean
  gameOver: boolean
  playerColor: Color
}

export default function Game({
  board,
  socket,
  setBoard,
  chess,
  checkEvent,
  invalidMove,
  gameOver,
  playerColor,
}: GameProps) {
  const [from, setFrom] = useState<Square | null>(null)
  const [checkedKingSquare, setCheckedKingSquare] = useState<Square | null>(null)

  useEffect(() => {
    console.log("[v0] Game component - Player color:", playerColor)
  }, [playerColor])

  const findKing = useCallback(
    (color: Color): Square | null => {
      const currentBoard = chess.board()
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const square = currentBoard[rank][file]
          if (square && square.type === "k" && square.color === color) {
            return `${"abcdefgh"[file]}${8 - rank}` as Square
          }
        }
      }
      return null
    },
    [chess],
  )

  useEffect(() => {
    if (checkEvent) {
      const kingSquare = findKing(checkEvent.color as Color)
      setCheckedKingSquare(kingSquare)
    } else {
      setCheckedKingSquare(null)
    }

    if (gameOver) {
    }
  }, [checkEvent, findKing, gameOver])

  const handleSquareClick = (square: Square) => {
    const piece = chess.get(square)
    if (!from) {
      if (!piece || piece.color !== playerColor) return
      console.log("[v0] Selected piece color:", piece.color, "Player color:", playerColor)
      setFrom(square)
    } else {
      socket.send(JSON.stringify({ type: "move", payload: { move: { from, to: square } } }))
      chess.move({ from, to: square })
      setFrom(null)
      setBoard(chess.board())
      setCheckedKingSquare(null)
    }
  }

  const displayBoard = playerColor === "b" && board ? [...board].reverse().map((row) => [...row].reverse()) : board

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-[640px]">
        {invalidMove && (
          <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-red-700 font-semibold text-sm">Invalid Move</span>
          </div>
        )}
        {checkEvent && (
          <div className="mb-3 px-4 py-3 bg-red-500 border border-red-600 rounded-xl text-center animate-pulse">
            <span className="text-white font-bold text-base">CHECK!</span>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-2xl shadow-xl border border-slate-200">
          <div className="border-4 border-slate-800 rounded-lg overflow-hidden shadow-inner">
            {displayBoard?.map((row, i) => {
              const actualRank = playerColor === "b" ? i : 7 - i
              return (
                <div key={i} className="flex">
                  {row.map((square, j) => {
                    const actualFile = playerColor === "b" ? 7 - j : j
                    const squareRepresentation = `${String.fromCharCode(97 + actualFile)}${actualRank + 1}` as Square
                    const isCheckedKing = checkedKingSquare === squareRepresentation
                    const isSelected = from === squareRepresentation
                    const isLightSquare = (actualRank + actualFile) % 2 === 0

                    return (
                      <button
                        key={squareRepresentation}
                        onClick={() => handleSquareClick(squareRepresentation)}
                        className={`
                          w-10 h-10 sm:w-14 sm:h-14 md:w-[70px] md:h-[70px] lg:w-20 lg:h-20
                          flex justify-center items-center
                          transition-all duration-150
                          relative
                          ${isLightSquare ? "bg-[#B5B5B5]" : "bg-stone-400"}
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
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
            <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl text-center border-2 border-slate-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Game Over</h2>
              <p className="mt-2 text-slate-600">Thanks for playing!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
