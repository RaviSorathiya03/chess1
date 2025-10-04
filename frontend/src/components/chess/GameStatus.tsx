interface GameStatusProps {
  gameStarted: boolean
  waiting: boolean
}

export function GameStatus({ gameStarted, waiting }: GameStatusProps) {
  if (gameStarted && !waiting) {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <div>
            <p className="font-semibold text-white text-sm sm:text-base">Game Started</p>
            <p className="text-xs sm:text-sm text-emerald-50">Both players connected</p>
          </div>
        </div>
      </div>
    )
  }

  if (waiting) {
    return (
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <div>
            <p className="font-semibold text-white text-sm sm:text-base">Waiting for Opponent</p>
            <p className="text-xs sm:text-sm text-amber-50">Searching for a player...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
        <div>
          <p className="font-semibold text-white text-sm sm:text-base">Ready to Play</p>
          <p className="text-xs sm:text-sm text-slate-200">Start a new game below</p>
        </div>
      </div>
    </div>
  )
}
