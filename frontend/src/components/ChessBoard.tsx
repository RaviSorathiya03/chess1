"use client"

import { useEffect, useState, useCallback } from "react"
import Game from "./Game"
import { useSocket } from "../hooks/useSocket"
import { Chess, type Color } from "chess.js"
import type { boardType } from "../types/board"
import Cookie from "js-cookie"
import { GameStatus } from "./chess/GameStatus"
import { GameInfo } from "./chess/GameInfo"
import { GameControls } from "./chess/GameControls"

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

  const handleSocketMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data)
      console.log("[v0] Received message:", message.type, message.payload)

      switch (message.type) {
        case "init_game":
          console.log("[v0] init_game received, payload:", message.payload)
          if (message.payload?.playerId && message.payload?.gameId) {
            const playerId = Cookie.get("playerId")
            const gameId = Cookie.get("gameId")
            console.log("[v0] Existing cookies - playerId:", playerId, "gameId:", gameId)

            if (!playerId || !gameId) {
              const newGame = new Chess()
              setChess(newGame)
              setBoard(newGame.board())
              const assignedColor = message.payload.color
              console.log("[v0] Setting player color to:", assignedColor)
              setPlayerColor(assignedColor)
              Cookie.set("playerId", message.payload.playerId)
              Cookie.set("gameId", message.payload.gameId)
              console.log("[v0] Cookies set - playerId:", message.payload.playerId, "gameId:", message.payload.gameId)
            }
          }
          break

        case "move":
          chess.move(message.payload.move)
          setBoard(chess.board())
          setCheckEvent(null)
          break

        case "check":
          setCheckEvent({ color: message.payload.color })
          break

        case "invalid_move":
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
          console.log("[v0] Game started! Current player color:", playerColor)
          break

        case "reconnect":
          console.log("[v0] Reconnect received, payload:", message.payload)
          const fen = message.payload?.board
          const moves = message.payload?.moves
          if (message.payload?.color) {
            console.log("[v0] Reconnect - setting player color to:", message.payload.color)
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
      }
    },
    [chess, playerColor],
  )

  useEffect(() => {
    if (!socket) return
    socket.onmessage = handleSocketMessage
  }, [socket, handleSocketMessage])

  useEffect(() => {
    if (!socket) return

    const playerId = Cookie.get("playerId")
    const gameId = Cookie.get("gameId")

    if (playerId && gameId) {
      console.log("[v0] Attempting reconnect with playerId:", playerId, "gameId:", gameId)
      const reconnectPayload = {
        type: "reconnect",
        payload: { playerId, gameId },
      }
      socket.send(JSON.stringify(reconnectPayload))
    }
  }, [socket])

  const handlePlayClick = () => {
    console.log("[v0] Play button clicked, sending init_game")
    socket?.send(JSON.stringify({ type: "init_game" }))
  }

  const gameStatus = chess.isCheckmate() ? "Checkmate" : chess.isCheck() ? "Check" : "Active"

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
              <GameStatus gameStarted={gameStarted} waiting={waiting} />
              <GameInfo
                gameStarted={gameStarted}
                playerColor={playerColor}
                currentTurn={chess.turn()}
                moveCount={chess.history().length}
                gameStatus={gameStatus}
              />
              <GameControls gameStarted={gameStarted} waiting={waiting} onPlayClick={handlePlayClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChessBoard
