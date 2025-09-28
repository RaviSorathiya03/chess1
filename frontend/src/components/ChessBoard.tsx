import React, { useEffect, useState, useCallback } from 'react';
import Game from './Game';
import { useSocket } from '../hooks/useSocket';
import { Chess, type Color } from 'chess.js';
import type { boardType } from '../types/board';

const ChessBoard = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(() => new Chess());
  const [board, setBoard] = useState<boardType | null>(chess.board());
  const [checkEvent, setCheckEvent] = useState<{ color: string } | null>(null);
  const [invalidMove, setInvalidMove] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerColor, setPlayerColor] = useState<Color>("w");
  const handleSocketMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'init_game':
          const newGame = new Chess();
          setPlayerColor(message.payload.color === "white" ? "w" : "b");
          setChess(newGame);
          setBoard(newGame.board());
          console.log('player has been connected');
          break;

        case 'move':
          chess.move(message.payload.move);
          setBoard(chess.board());
          console.log('move received');
          break;

        case 'check':
          console.log('CHECK event received in ChessBoard');
          setCheckEvent({ color: message.payload.color });
          break;

        case 'invalid_move':
          console.log('Invalid move received');
          setInvalidMove(true);
          setTimeout(() => setInvalidMove(false), 2000);
          break;

        case 'game_over':
          console.log('game over');
          setGameOver(true)
          break;

        default:
          console.log('unknown message received', message);
      }
    },
    [chess]
  );

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = handleSocketMessage;
  }, [socket, handleSocketMessage]);

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
