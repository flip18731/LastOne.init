import { motion } from 'framer-motion'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { displayPlayer, formatInit } from '../lib/utils'

export function Leaderboard({ limit = 10 }: { limit?: number }) {
  const { data, loading, error } = useLeaderboard(limit)

  const rankBadge = (i: number) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  const rankColor = (i: number) => {
    if (i === 0) return 'text-[#ffd700]'
    if (i === 1) return 'text-[#c0c0c0]'
    if (i === 2) return 'text-[#cd7f32]'
    return 'text-[#40405a]'
  }

  return (
    <div className="game-card">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a2e]">
        <span className="text-xs font-mono text-[#8080a0] tracking-widest">ALL-TIME WINNERS</span>
        {error && (
          <span className="text-xs font-mono text-[#ffd700] opacity-60">(demo data)</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#1a1a2e] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-0.5">
          {data.map((winner, i) => (
            <motion.div
              key={winner.address}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="leaderboard-row flex items-center gap-3 py-2.5 px-2 rounded"
            >
              {/* Rank */}
              <span className={`w-8 text-sm font-mono shrink-0 text-center ${rankColor(i)}`}>
                {rankBadge(i)}
              </span>

              {/* Player */}
              <span className={`flex-1 font-mono text-sm truncate ${
                i < 3 ? 'text-[#e0e0f0] font-bold' : 'text-[#c0c0e0]'
              }`}>
                {displayPlayer(winner.address, winner.username)}
              </span>

              {/* Rounds won */}
              <span className="text-[#8080a0] text-xs font-mono w-16 text-center">
                {winner.rounds_won}W
              </span>

              {/* Total winnings */}
              <span className={`text-xs font-mono w-24 text-right ${
                i === 0 ? 'neon-text-gold' : 'text-[#8080a0]'
              }`}>
                {formatInit(winner.total_winnings, 1)} INIT
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
