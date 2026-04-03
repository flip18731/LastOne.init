import { motion } from 'framer-motion'
import type { RevenueStats as RevenueStatsType } from '../types'
import { formatInit, formatLargeNumber } from '../lib/utils'

interface RevenueStatsProps {
  stats: RevenueStatsType | null
}

export function RevenueStats({ stats }: RevenueStatsProps) {
  if (!stats) return null

  const avgPot = stats.total_rounds > 0
    ? String(BigInt(stats.total_pot_distributed) / BigInt(stats.total_rounds))
    : '0'

  const items = [
    {
      label: 'House Revenue',
      value: `${formatInit(stats.total_revenue, 1)} INIT`,
      sub: '10% of every entry',
      color: '#00ff88',
      glow: 'rgba(0,255,136,0.3)',
    },
    {
      label: 'Total Rounds',
      value: formatLargeNumber(stats.total_rounds),
      sub: 'games played',
      color: '#00f0ff',
      glow: 'rgba(0,240,255,0.3)',
    },
    {
      label: 'Total Entries',
      value: formatLargeNumber(stats.total_entries),
      sub: 'players entered',
      color: '#ffd700',
      glow: 'rgba(255,215,0,0.3)',
    },
    {
      label: 'Avg Pot Size',
      value: `${formatInit(avgPot, 1)} INIT`,
      sub: 'per round',
      color: '#ff0066',
      glow: 'rgba(255,0,102,0.3)',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="game-card text-center"
          style={{ borderColor: `rgba(${item.color.slice(1).match(/../g)?.map(h => parseInt(h, 16)).join(',')}, 0.2)` }}
        >
          <div
            className="text-2xl font-mono font-black mb-1"
            style={{
              color: item.color,
              textShadow: `0 0 15px ${item.glow}`,
            }}
          >
            {item.value}
          </div>
          <div className="text-[#8080a0] text-xs font-mono">{item.label}</div>
          <div className="text-[#40405a] text-xs font-mono mt-0.5">{item.sub}</div>
        </motion.div>
      ))}
    </div>
  )
}
