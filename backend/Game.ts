import type WebSocket from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, INVALID_MOVE, MOVE } from "./messages";

export class Game{
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private moves: string[];
    private startTime: Date;
    private moveCount: number;

    constructor(player1: WebSocket, player2: WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
        this.moveCount = 0;
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload:{
                color: "white"
            }
        }))
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload:{
                color: "black"
            }
        }))
    }

    makeMove(socket: WebSocket, move: {
        from: string, 
        to: string
    }){
        console.log(move)
        if(this.moveCount% 2 == 0 && socket !== this.player1){
            return;
        }

        if(this.moveCount % 2 == 1 && socket !== this.player2){
            return;
        }

     
        try {
            this.board.move({
                from: move.from,
                to: move.to
            })
            this.moveCount++;
            console.log(this.board.turn());
        } catch (error) {
            if(this.moveCount%2==0){
                this.player1.send(JSON.stringify({
                    type: INVALID_MOVE,
                    payload: {
                        message: "Invalid Move"
                    }
                }))
            } else{
                this.player2.send(JSON.stringify({
                    type: INVALID_MOVE,
                    payload: {
                        message: "Invalid move"
                    }
                }))
            }
        }

      

        if(this.board.isGameOver()){
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload:{
                    winner: this.board.turn()=== "w"? "White": "Black"
                }
            }))
            return;
        }

        if(this.board.turn() == 'b'){
            
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: {
                    move: {
                        from: move.from,
                        to: move.to
                    }
                }
            }))
        }else{
           
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: {
                    move: {
                        from: move.from,
                        to: move.to
                    }
                }
            }))
        }
    
    }
}