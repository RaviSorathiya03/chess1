import type WebSocket from "ws";
import { Chess, Move } from "chess.js";
import { CHECK, GAME_OVER, INIT_GAME, INVALID_MOVE, MOVE } from "./messages";
import {redis} from  "./redisConfig"


export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private moves: string[];
  private startTime: Date;
  private gameId: string
  private boardFEN: string
  private disconnectedPlayers = new Set<string>();

  constructor(player1: WebSocket, player2: WebSocket, gameId: string) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.moves = [];
    this.startTime = new Date();
    this.gameId = gameId;
    this.boardFEN = this.board.fen();
    // Notify players of initial game state
    console.log("control is inside the contructor of the game state")
    this.sendToPlayer(this.player1, INIT_GAME, { color: "w", gameId, playerId: "player1" });
    this.sendToPlayer(this.player2, INIT_GAME, { color: "b", gameId, playerId: "player2"});
    console.log("control is in the last part of the contructor")

    this.player1.on("close", () => this.handleDisconnect("player1"));
    this.player2.on("close", () => this.handleDisconnect("player2"));
  }

   private async handleDisconnect(player: "player1" | "player2") {
    console.log(`${player} disconnected`);
    this.disconnectedPlayers.add(player);

    // If both players disconnected → clean up Redis + notify to clear cookies
    if (this.disconnectedPlayers.has("player1") && this.disconnectedPlayers.has("player2")) {
      console.log(`Both players disconnected → cleaning up game ${this.gameId}`);

      await redis.del(`game:${this.gameId}:moves`);
      await redis.del(`game:${this.gameId}:board`);

      try {
        this.player1.send(JSON.stringify({ type: "clear_cookies" }));
      } catch (_) {}
      try {
        this.player2.send(JSON.stringify({ type: "clear_cookies" }));
      } catch (_) {}
    }
  }

  /**
   * Send a message to a specific player
   */
  private sendToPlayer(player: WebSocket, type: string, payload: any) {
    player.send(JSON.stringify({ type, payload }));
  }

  /**
   * Notify correct player about the move that was just made
   */
  private broadcastMove(move: { from: string; to: string }) {
    const nextTurn = this.board.turn(); // 'w' means white's turn
    const playerToNotify = nextTurn === "b" ? this.player2 : this.player1;

    this.sendToPlayer(playerToNotify, MOVE, { move });
  }

  /**
   * Notify the player whose king is in check
   */
  private handleCheck() {
    if (!this.board.isCheck()) return;

    const colorInCheck = this.board.turn(); // Player whose turn it is, is in check
    const playerInCheck = colorInCheck === "w" ? this.player1 : this.player2;

    this.sendToPlayer(playerInCheck, CHECK, {
      message: "check",
      color: colorInCheck,
    });
  }

  /**
   * Handle end of game scenario
   */
  private handleGameOver() {
    if (!this.board.isGameOver()) return;

    let winner = null;
    if (this.board.isCheckmate()) {
      winner = this.board.turn() === "w" ? "Black" : "White"; // The opposite side delivered checkmate
    }

    const payload = { winner, reason: this.board.isCheckmate() ? "checkmate" : "draw" };
    this.sendToPlayer(this.player1, GAME_OVER, payload);
    this.sendToPlayer(this.player2, GAME_OVER, payload);
  }

  /**
   * Make a move for the current player
   */
  public async makeMove(socket: WebSocket, move: { from: string; to: string }) {
    // Validate turn based on socket
    const currentTurn = this.board.turn(); // 'w' or 'b'
    if ((currentTurn === "w" && socket !== this.player1) ||
        (currentTurn === "b" && socket !== this.player2)) {
      return; // Not this player's turn
    }

    try {
      const result: Move = this.board.move(move);
      if (!result) {
        throw new Error("Invalid move");
      }

      this.moves.push(result.san); // store SAN notation move
      await redis.rPush(`game:${this.gameId}:moves`, JSON.stringify(move));
      await redis.set(`game:${this.gameId}:board`, this.boardFEN);
      // Notify other player about the move
      this.broadcastMove(move);

      // Check for check or game over
      this.handleCheck();
      this.handleGameOver();

      

    } catch (error) {
      // Send invalid move notification
      const playerToNotify = currentTurn === "w" ? this.player1 : this.player2;
      this.sendToPlayer(playerToNotify, INVALID_MOVE, {
        message: "Invalid Move",
      });
    }
  }

  reconnect(socket: WebSocket, board: string, moves: string[], playerId: string){
   console.log("control is reaching here")
   console.log(playerId)
   if(playerId == "player1"){
        this.player1 = socket;
       this.player1.send(JSON.stringify({
           type: "reconnect",
           payload:{
               board: board,
               moves,
           }
       }))
   } else{
        this.player2 = socket;
       this.player2.send(JSON.stringify({
           type: "reconnect",
           payload: {
               board: board,
               moves
           }
       }))
   }
} 


}
