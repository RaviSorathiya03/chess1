import type WebSocket from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import { v4 as uuidv4 } from "uuid";
import { redis } from "./redisConfig";

export class GameManager {
  private games: Map<string, Game>; // store games by gameId
  private pendingUser: WebSocket | null;
  private users: Map<WebSocket, { gameId?: string; playerId?: string }>; // track which user belongs to which game

  constructor() {
    this.games = new Map();
    this.users = new Map();
    this.pendingUser = null;
  }

  addUser(socket: WebSocket) {
    this.users.set(socket, {});
    this.addHandlers(socket);
  }

  removeUser(socket: WebSocket) {
    this.users.delete(socket);
    // Optionally handle game termination if needed
    if (this.pendingUser === socket) {
      console.log("Pending user disconnected — resetting pendingUser");
      this.pendingUser = null;
    }

    this.users.delete(socket);

    
  }

  private addHandlers(socket: WebSocket) {
    socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          // Create new game and store it
          const gameId = uuidv4();
          const game = new Game(this.pendingUser, socket, gameId);
          this.games.set(gameId, game);

          this.users.set(this.pendingUser, { gameId, playerId: "player1" });
          this.users.set(socket, { gameId, playerId: "player2" });
          this.pendingUser.send(JSON.stringify({ type: "game_started" }));
          this.pendingUser = null;
          socket.send(JSON.stringify({ type: "game_started" }));
        } else {
          this.pendingUser = socket;
          this.pendingUser.send(JSON.stringify({ type: "pending_user" }));
        }
      }

      if (message.type === MOVE) {
        const userInfo = this.users.get(socket);
        if (!userInfo?.gameId) return;

        const game = this.games.get(userInfo.gameId);
        if (!game) return;

        game.makeMove(socket, message.payload.move);
      }

      if (message.type === "reconnect") {
        console.log("controle is reaching here");

        const { gameId, playerId } = message.payload;

        // Step 1: Find the game from memory
        const game = this.games.get(gameId);
        if (!game) {
            console.log("No game found with this gameId:", gameId);
            return;
        }

        // Step 2: Re-associate this socket with the game
        this.users.set(socket, { gameId, playerId });

        // Step 3: Restore game state from Redis
        const boardFen = await redis.get(`game:${gameId}:board`);
        const moves = await redis.lRange(`game:${gameId}:moves`, 0, -1);

        // Step 4: Trigger game-level reconnect logic
        game.reconnect(socket, boardFen!, moves, playerId);
    }
    });
  }
}
