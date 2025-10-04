"use client"

import { Button } from "../ui/button"

interface GameControlsProps {
  gameStarted: boolean
  waiting: boolean
  onPlayClick: () => void
  onResign?: () => void
}

export function GameControls({ gameStarted, waiting, onPlayClick, onResign }: GameControlsProps) {
  if (gameStarted && onResign) {
    return (
      <div className="p-4 sm:p-6 border-t border-slate-100">
        <Button
          onClick={onResign}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-semibold py-5 sm:py-6 text-base sm:text-lg rounded-xl transition-all duration-200 bg-transparent"
        >
          Resign Game
        </Button>
      </div>
    )
  }

  if (gameStarted) {
    return null
  }

  return (
    <div className="p-4 sm:p-6">
      <Button
        onClick={onPlayClick}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200"
        disabled={waiting}
      >
        {waiting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Searching...
          </span>
        ) : (
          "Play Online"
        )}
      </Button>
    </div>
  )
}
