import React, { useEffect, useState, useCallback } from 'react';
import Game from './Game';
import { useSocket } from '../hooks/useSocket';
import { Chess, type Color } from 'chess.js';
import type { boardType } from '../types/board';
import Cookie from "js-cookie";

const ChessBoard = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(() => new Chess());
  const [board, setBoard] = useState<boardType | null>(chess.board());
  const [checkEvent, setCheckEvent] = useState<{ color: string } | null>(null);
  const [invalidMove, setInvalidMove] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>("w");

  // Handle incoming socket messages
  const handleSocketMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "init_game":
          // Only set cookies if new player
          if (message.payload?.playerId && message.payload?.gameId) {
            const playerId = Cookie.get("playerId");
            const gameId = Cookie.get("gameId");

            if (!playerId || !gameId) {
              // New player → set cookies with info from backend
              const newGame = new Chess();
              setChess(newGame);
              setBoard(newGame.board());
              setPlayerColor(message.payload.color)
              Cookie.set("playerId", message.payload.playerId);
              Cookie.set("gameId", message.payload.gameId);

              console.log("New player connected:", message.payload.playerId);
            }
          }
          break;

        case "move":
          chess.move(message.payload.move);
          setBoard(chess.board());
          console.log("Move received:", message.payload.move);
          break;

        case "check":
          console.log("CHECK event received in ChessBoard");
          setCheckEvent({ color: message.payload.color });
          break;

        case "invalid_move":
          console.log("Invalid move received");
          setInvalidMove(true);
          setTimeout(() => setInvalidMove(false), 2000);
          break;

        case "game_over":
          console.log("Game over");
          setGameOver(true);
          break;

        case "reconnect":
          console.log("Reconnection successful, restoring board");
          if (message.payload?.boardFEN) {
            const newChess = new Chess(message.payload.boardFEN);
            setChess(newChess);
            setBoard(newChess.board());
          }
          break;

        default:
          console.log("Unknown message received", message);
      }
    },
    [chess]
  );

  // Set socket message handler
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = handleSocketMessage;
  }, [socket, handleSocketMessage]);

  // Auto reconnect if cookies exist
  useEffect(() => {
    if (!socket) return;

    const playerId = Cookie.get("playerId");
    const gameId = Cookie.get("gameId");

    if (playerId && gameId) {
      const reconnectPayload = {
        type: "reconnect",
        payload: { playerId, gameId },
      };
      console.log("Auto reconnecting with cookies:", reconnectPayload);
      socket.send(JSON.stringify(reconnectPayload));
    }
  }, [socket]);

  if (!socket) return <div>Loading...</div>;

  return (
    <div className="flex justify-center bg-black w-screen h-screen text-white">
      <div className="pt-8 max-w-screen-lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-4 bg-red-200">
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
          <div className="col-span-4">
            <button
              onClick={() => {
                socket.send(JSON.stringify({ type: 'init_game' }));
              }}
            >
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
