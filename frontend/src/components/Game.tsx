"use client"

import type { Color, Square } from "chess.js"
import { useCallback, useEffect, useState } from "react"
import type { boardType } from "../types/board"
import { ChessSquare } from "./chess/ChessSquare"
import { StatusMessages } from "./chess/StatusMessages"
import { GameOverOverlay } from "./chess/GameOverOverlay"

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
  }, [checkEvent, findKing])

  const handleSquareClick = (square: Square) => {
    const piece = chess.get(square)

    if (!from) {
      if (!piece || piece.color !== playerColor) return
      setFrom(square)
    } else {
      if (from === square) {
        setFrom(null)
        return
      }

      if (piece && piece.color === playerColor) {
        setFrom(square)
        return
      }

      socket.send(JSON.stringify({ type: "move", payload: { move: { from, to: square } } }))
      chess.move({ from, to: square })
      setFrom(null)
      setBoard(chess.board())
    }
  }

  const displayBoard = playerColor === "b" && board ? [...board].reverse().map((row) => [...row].reverse()) : board

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <StatusMessages invalidMove={invalidMove} checkEvent={checkEvent} />

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
                      <ChessSquare
                        key={squareRepresentation}
                        square={square}
                        squareRepresentation={squareRepresentation}
                        isLightSquare={isLightSquare}
                        isCheckedKing={isCheckedKing}
                        isSelected={isSelected}
                        playerColor={playerColor}
                        onClick={handleSquareClick}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        <GameOverOverlay gameOver={gameOver} />
      </div>
    </div>
  )
}
