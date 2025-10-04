interface GameOverOverlayProps {
  gameOver: boolean
}

export function GameOverOverlay({ gameOver }: GameOverOverlayProps) {
  if (!gameOver) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
      <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl text-center border-2 border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Game Over</h2>
        <p className="mt-2 text-slate-600">Thanks for playing!</p>
      </div>
    </div>
  )
}
