import type WebSocket from "ws";
import { Chess, Move } from "chess.js";
import { CHECK, GAME_OVER, INIT_GAME, INVALID_MOVE, MOVE } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess;
  private moves: string[];
  private startTime: Date;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.moves = [];
    this.startTime = new Date();

    // Notify players of initial game state
    this.sendToPlayer(this.player1, INIT_GAME, { color: "white" });
    this.sendToPlayer(this.player2, INIT_GAME, { color: "black" });
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
  public makeMove(socket: WebSocket, move: { from: string; to: string }) {
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
}
