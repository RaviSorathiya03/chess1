"use client"

import { useEffect, useState, useCallback } from "react"
import Game from "./Game"
import { useSocket } from "../hooks/useSocket"
import { Chess, type Color } from "chess.js"
import type { boardType } from "../types/board"
import Cookie from "js-cookie"
import { Button } from "./ui/button"

const ChessBoard = () => {
  const socket = useSocket()
  const [chess, setChess] = useState(() => new Chess())
  const [board, setBoard] = useState<boardType | null>(chess.board())
  const [checkEvent, setCheckEvent] = useState<{ color: string } | null>(null)
  const [invalidMove, setInvalidMove] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [playerColor, setPlayerColor] = useState<Color>("w")
  const [waiting, setWaiting] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  // Handle incoming socket messages
  const handleSocketMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data)
      console.log("[v0] Received message:", message.type, message.payload)

      switch (message.type) {
        case "init_game":
          if (message.payload?.playerId && message.payload?.gameId) {
            const playerId = Cookie.get("playerId")
            const gameId = Cookie.get("gameId")

            if (!playerId || !gameId) {
              const newGame = new Chess()
              setChess(newGame)
              setBoard(newGame.board())
              console.log("[v0] Setting player color to:", message.payload.color)
              setPlayerColor(message.payload.color)
              Cookie.set("playerId", message.payload.playerId)
              Cookie.set("gameId", message.payload.gameId)

              console.log("[v0] New player connected:", message.payload.playerId, "Color:", message.payload.color)
            }
          }
          break

        case "move":
          chess.move(message.payload.move)
          setBoard(chess.board())
          console.log("[v0] Move received:", message.payload.move)
          break

        case "check":
          console.log("[v0] CHECK event received in ChessBoard")
          setCheckEvent({ color: message.payload.color })
          break

        case "invalid_move":
          console.log("[v0] Invalid move received")
          setInvalidMove(true)
          setTimeout(() => setInvalidMove(false), 2000)
          break

        case "game_over":
          Cookie.remove("playerId")
          Cookie.remove("gameId")
          setGameOver(true)
          break

        case "pending_user":
          setWaiting(true)
          break

        case "game_started":
          setWaiting(false)
          setGameStarted(true)
          console.log("[v0] Game started! Player color:", playerColor)
          break

        case "reconnect":
          console.log("[v0] Reconnection successful, restoring board")
          const fen = message.payload?.board
          const moves = message.payload?.moves
          if (message.payload?.color) {
            console.log("[v0] Restoring player color:", message.payload.color)
            setPlayerColor(message.payload.color)
          }

          if (fen) {
            const newChess = new Chess(fen)

            if (moves?.length) {
              moves.forEach((move: any) => {
                const moveObj = typeof move === "string" ? JSON.parse(move) : move
                newChess.move(moveObj)
              })
            }

            setChess(newChess)
            setBoard(newChess.board().map((row) => row.map((cell) => (cell ? { ...cell } : null))))
          }
          break

        case "clear_cookies":
          Cookie.remove("playerId")
          Cookie.remove("gameId")
          break

        default:
          console.log("[v0] Unknown message received", message)
      }
    },
    [chess, playerColor],
  )

  // Set socket message handler
  useEffect(() => {
    if (!socket) return
    socket.onmessage = handleSocketMessage
  }, [socket, handleSocketMessage])

  // Auto reconnect if cookies exist
  useEffect(() => {
    if (!socket) return

    const playerId = Cookie.get("playerId")
    const gameId = Cookie.get("gameId")

    if (playerId && gameId) {
      const reconnectPayload = {
        type: "reconnect",
        payload: { playerId, gameId },
      }
      console.log("Auto reconnecting with cookies:", reconnectPayload)
      socket.send(JSON.stringify(reconnectPayload))
    }
  }, [socket])

  if (!socket) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 mx-auto" />
          <p className="text-slate-600 font-medium">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">Online Chess</h1>
          <p className="mt-1 text-slate-500 text-center text-sm sm:text-base">Play with friends around the world</p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="flex justify-center">
            <Game
              setBoard={setBoard}
              chess={chess}
              board={board}
              socket={socket}
              checkEvent={checkEvent}
              invalidMove={invalidMove}
              gameOver={gameOver}
              playerColor={playerColor}
            />
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {gameStarted && !waiting && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                    <div>
                      <p className="font-semibold text-white text-sm sm:text-base">Game Started</p>
                      <p className="text-xs sm:text-sm text-emerald-50">Both players connected</p>
                    </div>
                  </div>
                </div>
              )}

              {waiting && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                    <div>
                      <p className="font-semibold text-white text-sm sm:text-base">Waiting for Opponent</p>
                      <p className="text-xs sm:text-sm text-amber-50">Searching for a player...</p>
                    </div>
                  </div>
                </div>
              )}

              {!gameStarted && !waiting && (
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    <div>
                      <p className="font-semibold text-white text-sm sm:text-base">Ready to Play</p>
                      <p className="text-xs sm:text-sm text-slate-200">Start a new game below</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {gameStarted && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Your Color</span>
                      <span className="font-semibold text-slate-900">{playerColor === "w" ? "White" : "Black"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Current Turn</span>
                      <span className="font-semibold text-slate-900">{chess.turn() === "w" ? "White" : "Black"}</span>
                    </div>
                  </div>
                )}

                {!gameStarted && (
                  <Button
                    onClick={() => {
                      socket.send(JSON.stringify({ type: "init_game" }))
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200"
                    disabled={waiting}
                  >
                    {waiting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Searching...
                      </span>
                    ) : (
                      "Play Online"
                    )}
                  </Button>
                )}

                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Game Stats</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Moves</span>
                    <span className="font-semibold text-slate-900">{chess.history().length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <span className="font-semibold text-slate-900">
                      {chess.isCheckmate() ? "Checkmate" : chess.isCheck() ? "Check" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChessBoard
