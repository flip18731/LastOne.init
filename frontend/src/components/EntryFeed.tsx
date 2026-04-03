import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Entry } from '../types'
import { displayPlayer, timeAgo } from '../lib/utils'

interface EntryFeedProps {
  entries: Entry[]
  last_entry_address: string
}

interface FeedEntry extends Entry {
  isNew: boolean
}

const MAX_FEED_ITEMS = 20

export function EntryFeed({ entries, last_entry_address }: EntryFeedProps) {
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([])
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (!entries.length) return

    // Show most recent entries first, mark new ones
    const reversed = [...entries].reverse().slice(0, MAX_FEED_ITEMS)
    const mapped: FeedEntry[] = reversed.map((entry, i) => ({
      ...entry,
      isNew: i === 0 && entries.length > prevCountRef.current,
    }))

    setFeedEntries(mapped)
    prevCountRef.current = entries.length

    // Clear "new" flag after animation
    if (mapped[0]?.isNew) {
      setTimeout(() => {
        setFeedEntries(prev => prev.map((e, i) => i === 0 ? { ...e, isNew: false } : e))
      }, 1000)
    }
  }, [entries])

  if (!feedEntries.length) {
    return (
      <div className="game-card h-full min-h-[300px] flex items-center justify-center">
        <div className="text-center text-[#40405a]">
          <div className="text-2xl mb-2">📭</div>
          <div className="text-sm font-mono">No entries yet</div>
          <div className="text-xs mt-1">Be the first to enter!</div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#1a1a2e]">
        <div className="flex items-center gap-2">
          <span className="glow-dot glow-dot-green" />
          <span className="text-xs font-mono text-[#8080a0] tracking-widest">LIVE FEED</span>
        </div>
        <span className="text-xs font-mono text-[#40405a]">{feedEntries.length} shown</span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
        <AnimatePresence mode="popLayout">
          {feedEntries.map((entry) => (
            <motion.div
              key={`${entry.entry_number}-${entry.timestamp}`}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeedItem
                entry={entry}
                isLast={entry.address === last_entry_address}
                isNew={entry.isNew}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function FeedItem({
  entry,
  isLast,
  isNew,
}: {
  entry: FeedEntry
  isLast: boolean
  isNew: boolean
}) {
  return (
    <motion.div
      className={`flex items-center justify-between py-2 px-2 rounded transition-all ${
        isNew ? 'bg-[rgba(0,240,255,0.08)]' : 'hover:bg-[rgba(255,255,255,0.02)]'
      } ${isLast ? 'border-l-2 border-[#00f0ff]' : 'border-l-2 border-transparent'}`}
      animate={isNew ? { backgroundColor: ['rgba(0,240,255,0.12)', 'transparent'] } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Entry number */}
      <span className="text-[#40405a] text-xs font-mono w-8 shrink-0">
        #{entry.entry_number}
      </span>

      {/* Player name */}
      <span
        className={`flex-1 text-sm font-mono truncate ${
          isLast ? 'text-[#00f0ff] font-bold' : 'text-[#c0c0e0]'
        }`}
      >
        {displayPlayer(entry.address, entry.username)}
        {isLast && (
          <span className="ml-1.5 text-[10px] text-[#00f0ff] opacity-70 tracking-wider">
            ← LAST
          </span>
        )}
      </span>

      {/* Time ago */}
      <span className="text-[#40405a] text-xs font-mono shrink-0 ml-2">
        {timeAgo(entry.timestamp)}
      </span>
    </motion.div>
  )
}
