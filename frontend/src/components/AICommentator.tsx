import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameEvent } from '../types'
import { generateAIComment, shouldTriggerComment } from '../lib/ai-commentator'
import { formatInit } from '../lib/utils'

interface AICommentatorProps {
  entry_count: number
  pot: string
  countdown_remaining: number
  round_id: number
  last_username: string
  status: string
}

interface Comment {
  id: number
  text: string
  type: GameEvent['type']
  timestamp: number
}

export function AICommentator({
  entry_count,
  pot,
  countdown_remaining,
  round_id,
  last_username,
  status,
}: AICommentatorProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [current, setCurrent] = useState<Comment | null>(null)
  const [loading, setLoading] = useState(false)
  const prevEntryRef = useRef(0)
  const prevPotRef = useRef(0)

  const potInit = parseFloat(formatInit(pot, 2))

  useEffect(() => {
    const isWin = status === 'Ended' && prevEntryRef.current > 0
    const triggerType = shouldTriggerComment(
      entry_count,
      countdown_remaining,
      potInit,
      isWin,
      prevPotRef.current
    )

    if (triggerType && entry_count !== prevEntryRef.current) {
      const event: GameEvent = {
        type: triggerType,
        player_username: last_username || 'anon',
        pot_size: potInit,
        countdown_remaining,
        entry_number: entry_count,
        round_id,
      }

      setLoading(true)
      generateAIComment(event).then(text => {
        const comment: Comment = {
          id: Date.now(),
          text,
          type: triggerType,
          timestamp: Date.now(),
        }
        setCurrent(comment)
        setComments(prev => [comment, ...prev].slice(0, 5))
        setLoading(false)
      })
    }

    prevEntryRef.current = entry_count
    prevPotRef.current = potInit
  }, [entry_count, status])

  const getBorderColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'win': return 'border-[rgba(255,215,0,0.4)]'
      case 'close_call': return 'border-[rgba(255,0,102,0.4)]'
      case 'milestone': return 'border-[rgba(0,255,136,0.4)]'
      default: return 'border-[rgba(0,240,255,0.2)]'
    }
  }

  return (
    <div className="relative">
      {/* AI label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#8080a0] text-xs font-mono tracking-widest">AI COMMENTATOR</span>
        {loading && (
          <motion.span
            className="text-[#00f0ff] text-xs font-mono"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ●●●
          </motion.span>
        )}
      </div>

      {/* Current comment */}
      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id}
            className={`ai-commentator ${getBorderColor(current.type)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <TypewriterText text={current.text} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="ai-commentator opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
          >
            <span className="text-[#8080a0] text-sm font-mono italic">
              Watching the game... commentary coming soon 👀
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(prev => prev + text[indexRef.current])
        indexRef.current++
      } else {
        clearInterval(interval)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [text])

  return (
    <p className="text-[#e0e0f0] text-sm font-mono leading-relaxed">
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          className="text-[#00f0ff]"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </p>
  )
}
