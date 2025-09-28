import type WebSocket from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import { randomUUIDv5 } from "bun";
import { v4 as uuidv4 } from "uuid";
import { redis } from "./redisConfig";


export class GameManager{
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];
    private gameId = uuidv4();
    constructor(){
        this.games = [];
        this.users = []
        this.pendingUser = null;
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.addHandlers(socket);
        
    }

    removeUser(socket: WebSocket){
        this.users = this.users.filter(user => user !== socket);
        //stop the game if the user leaves the game
    }

    private addHandlers(socket: WebSocket){
    
        socket.on("message", async(data)=>{
            
            const message = JSON.parse(data.toString());
            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    console.log("control has been reach here")
                    const game = new Game(this.pendingUser, socket, this.gameId);
                    this.games.push(game);
                    this.pendingUser = null;
                } else{
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE){
              
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                if(game){
                   
                    game.makeMove(socket, message.payload.move);
                }
            }

            if(message.type === "reconnect"){
                const boardFen = await redis.get(`game:${this.gameId}:board`);
                const moves = await redis.lRange(`game:${this.gameId}:moves`, 0, -1);
                const playerId = message.payload;
                const game = this.games.find(game=>game.player1 === socket || game.player2 === socket);
                game?.reconnect(boardFen!, moves, playerId);
            }
        })
    }
}