import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { HistoryRound } from '../types'
import { getMockHistoryRounds } from '../lib/contract'
import { displayPlayer, formatDate, formatInit } from '../lib/utils'

export function RoundHistory() {
  const [rounds, setRounds] = useState<HistoryRound[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with real query when contract is deployed
    setRounds(getMockHistoryRounds())
    setLoading(false)
  }, [])

  return (
    <div className="game-card">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a2e]">
        <span className="text-xs font-mono text-[#8080a0] tracking-widest">RECENT ROUNDS</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-[#1a1a2e] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {rounds.map((round, i) => (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 py-2.5 px-2 rounded
                border border-transparent hover:border-[#1a1a2e]
                hover:bg-[rgba(255,255,255,0.02)] transition-all cursor-pointer"
            >
              {/* Round ID */}
              <span className="text-[#40405a] text-xs font-mono w-10 shrink-0">
                #{round.id}
              </span>

              {/* Winner */}
              <span className="flex-1 text-sm font-mono text-[#e0e0f0] truncate">
                {round.winner_username
                  ? displayPlayer(round.winner!, round.winner_username)
                  : '—'}
              </span>

              {/* Pot */}
              <span className="text-[#ffd700] text-xs font-mono w-20 text-right">
                {formatInit(round.pot, 1)} INIT
              </span>

              {/* Entries */}
              <span className="text-[#8080a0] text-xs font-mono w-12 text-right">
                {round.entries_count}↗
              </span>

              {/* Date */}
              <span className="text-[#40405a] text-xs font-mono w-28 text-right hidden md:block">
                {formatDate(round.ended_at)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
