import type { Color, PieceSymbol, Square } from 'chess.js'
import React, { useEffect, useRef, useState } from 'react'
import type { boardType } from '../types/board';

function Game({board, socket, setBoard, chess}: {
    board: boardType | null,
    socket: WebSocket, 
    setBoard: any,
    chess: any
}) {
    useEffect(()=>{
        if(!socket){
            return;
        }
        socket.onmessage = (event)=>{
            const message = JSON.parse(event.data);
            switch(message.type){
                case "invalid_move":
                        setFrom(null);
                        setTo(null);
                        setInvalidMove(true);
                        //@ts-ignore
                        audioRef?.current?.play();
                        setTimeout(()=>{
                            setInvalidMove(false);
                            //@ts-ignore
                            audioRef?.current?.pause();
                        }, 2000)
                        break;
            }
        }
    }, [socket.onmessage])
    const [from, setFrom] = useState<Square | null>(null);
    const [to, setTo] = useState<Square | null>(null);
    const audioRef = useRef(null);
    const [invalidMove, setInvalidMove] = useState(false);
  return (
    <div className='text-white'>
        <h1 className={`text-3xl ${invalidMove? 'visible': 'invisible'} text-black`}>Invalid Move</h1>
        <audio ref={audioRef} src="./illegal.mp3"></audio>
      {board!.map((row, i)=>{
        return <div key={i} className='flex'>
            {
                row.map((square, j)=>{
                    const squareReprentation = String.fromCharCode(97 + (j%8)) + "" + (8-i) as Square
                    return <div onClick={()=>{
                        if(from === null){
                            setFrom(squareReprentation)
                        } else{
                            setTo(squareReprentation)
                            socket.send(JSON.stringify({
                                type: "move",
                                payload:{
                                    move:{
                                        from: from,to:squareReprentation
                                    } 
                                }
                            }))
                            
                            chess.move({
                                from, to: squareReprentation
                            })
                            setFrom(null)
                            setBoard(chess.board());
                           
        
                        }
                    }}  className={`w-16 h-16 ${(i+j) % 2 == 0? 'bg-green-500':'bg-slate-300'} text-black`}>
                        <div className='w-full h-full flex justify-center items-center'>
                        {square ? <img className="w-4" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`} /> : null}
                        </div>
                    </div>
                })
            }

        </div>
      })}
    </div>
  )
}

export default Game
