import type { Color, Square } from "chess.js";
import { useCallback, useEffect, useState } from "react";
import type { boardType } from "../types/board";

interface GameProps {
  board: boardType | null;
  socket: WebSocket;
  setBoard: (b: boardType) => void;
  chess: any;
  checkEvent: { color: string } | null;
  invalidMove: boolean;
  gameOver: boolean;
  playerColor: Color
}

export default function Game({ board, socket, setBoard, chess, checkEvent, invalidMove, gameOver, playerColor }: GameProps) {
  const [from, setFrom] = useState<Square | null>(null);
  const [checkedKingSquare, setCheckedKingSquare] = useState<Square | null>(null);

  const findKing = useCallback(
    (color: Color): Square | null => {
      const currentBoard = chess.board();
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const square = currentBoard[rank][file];
          if (square && square.type === 'k' && square.color === color) {
            return `${'abcdefgh'[file]}${8 - rank}` as Square;
          }
        }
      }
      return null;
    },
    [chess]
  );

  useEffect(() => {
    if (checkEvent) {
      const kingSquare = findKing(checkEvent.color as Color);
      setCheckedKingSquare(kingSquare);
    } else {
      setCheckedKingSquare(null);
    }

    if(gameOver){
      
    }
  }, [checkEvent, findKing]);

  const handleSquareClick = (square: Square) => {
    const piece = chess.get(square);
    if (!from) {
      if (!piece || piece.color !== playerColor) return;
      console.log(piece.color==playerColor)
      setFrom(square);
    } else {
      socket.send(JSON.stringify({ type: 'move', payload: { move: { from, to: square } } }));
      chess.move({ from, to: square });
      setFrom(null);
      setBoard(chess.board());
      setCheckedKingSquare(null);
    }
  };

  return (
    <div className="text-white">
      <h1 className={`text-3xl ${invalidMove ? 'visible' : 'invisible'} text-black`}>
        Invalid Move
      </h1>
      <h1 className={`text-3xl ${gameOver ? 'visible' : 'invisible'} text-black`}>
        Game Over
      </h1>
      {board?.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => {
            const squareRepresentation = `${String.fromCharCode(97 + (j % 8))}${8 - i}` as Square;
            const isCheckedKing = checkedKingSquare === squareRepresentation;
            const isSelected = from === squareRepresentation;
            return (
              <div
                key={squareRepresentation}
                onClick={() => handleSquareClick(squareRepresentation)}
                className={`w-16 h-16 flex justify-center items-center 
                  ${(i + j) % 2 === 0 ? 'bg-green-500' : 'bg-slate-300'}
                  ${isCheckedKing ? 'bg-red-500' : ''}
                  ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                  
              >
                {square ? (
                  <img
                    className="w-4"
                    src={`/${
                      square.color === 'b' ? square.type : `${square.type?.toUpperCase()} copy`
                    }.png`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}