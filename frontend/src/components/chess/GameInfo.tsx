import type { Color } from "chess.js"

interface GameInfoProps {
  gameStarted: boolean
  playerColor: Color
  currentTurn: Color
  moveCount: number
  gameStatus: string
}

export function GameInfo({ gameStarted, playerColor, currentTurn, moveCount, gameStatus }: GameInfoProps) {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {gameStarted && (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Your Color</span>
            <span className="font-semibold text-slate-900">{playerColor === "w" ? "White" : "Black"}</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Current Turn</span>
            <span className="font-semibold text-slate-900">{currentTurn === "w" ? "White" : "Black"}</span>
          </div>
        </div>
      )}

      <div className="space-y-2 pt-4 border-t border-slate-200">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Game Stats</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Moves</span>
          <span className="font-semibold text-slate-900">{moveCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Status</span>
          <span className="font-semibold text-slate-900">{gameStatus}</span>
        </div>
      </div>
    </div>
  )
}
