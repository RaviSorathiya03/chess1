interface StatusMessagesProps {
  invalidMove: boolean
  checkEvent: { color: string } | null
}

export function StatusMessages({ invalidMove, checkEvent }: StatusMessagesProps) {
  return (
    <div className="w-full max-w-[640px]">
      {invalidMove && (
        <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-red-700 font-semibold text-sm">Invalid Move</span>
        </div>
      )}
      {checkEvent && (
        <div className="mb-3 px-4 py-3 bg-red-500 border border-red-600 rounded-xl text-center animate-pulse">
          <span className="text-white font-bold text-base">CHECK!</span>
        </div>
      )}
    </div>
  )
}
