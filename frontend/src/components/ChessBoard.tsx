import React, { useEffect, useState } from 'react'
import Game from './Game'
import { useSocket } from '../hooks/useSocket'
import {Chess} from 'chess.js'
import type { boardType } from '../types/board'

const ChessBoard = () => {
  const socket = useSocket();

  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState<boardType | null>(chess.board());

  useEffect(()=>{
      if(!socket){
        return;
    }

    socket.onmessage = (event)=>{
      const message = JSON.parse(event.data);
      console.log(message);
      switch(message.type){
        case 'init_game': 
                setChess(new Chess());
                console.log("player has been connected");
                break;
        case 'move': 
                const move = message.payload.move;
                console.log(move)
                chess.move(move);
                setBoard(chess.board());
                console.log("move received");
                break;
        case 'game_over':
                console.log("game over");
                break;
        default:
                console.log("unknown message received");
      }
    }
  }, [socket, board, chess])

  if(!socket) return (<div>Loading...</div>);

  return (
    <div className='flex justify-center bg-black w-screen h-screen text-white'>
      <div className='pt-8 max-w-screen-lg'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='col-span-4 bg-red-200'>
            <Game setBoard={setBoard} chess={chess} board={board} socket={socket}/>
            </div>
            <div className='col-span-4'>
              <button onClick={()=>{
                socket.send(JSON.stringify({
                  type: "init_game"
                }))
              }}>Play</button>
            </div>
        </div>
        
      </div>
    </div>
  )
}

export default ChessBoard
