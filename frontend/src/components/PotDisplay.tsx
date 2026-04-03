import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatInit } from '../lib/utils'

interface PotDisplayProps {
  pot: string   // in uinit
  entries_count: number
}

export function PotDisplay({ pot, entries_count }: PotDisplayProps) {
  const prevPotRef = useRef(pot)
  const [growing, setGrowing] = useState(false)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    if (pot !== prevPotRef.current && BigInt(pot) > BigInt(prevPotRef.current)) {
      setGrowing(true)

      // Spawn particles
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 120,
        y: -(Math.random() * 60 + 20),
      }))
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 800)
      setTimeout(() => setGrowing(false), 600)

      prevPotRef.current = pot
    }
  }, [pot])

  const initAmount = formatInit(pot, 2)
  const initAmountLarge = formatInit(pot, 0)

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Label */}
      <div className="text-[#8080a0] text-xs font-mono tracking-[0.2em] uppercase">
        Prize Pool
      </div>

      {/* Main pot amount */}
      <div className="relative">
        <AnimatePresence>
          {growing && (
            <>
              {/* Gold flash overlay */}
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)' }}
              />
              {/* Particles */}
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#ffd700] pointer-events-none"
                  style={{ left: '50%', top: '50%' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.div
          animate={growing ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center"
        >
          <span
            className="font-mono font-black text-5xl md:text-6xl"
            style={{
              color: '#ffd700',
              textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.4)',
            }}
          >
            {initAmount}
          </span>
          <span className="text-[#ffd700] font-mono font-bold text-xl ml-2 opacity-70">
            INIT
          </span>
        </motion.div>
      </div>

      {/* Sub-info */}
      <div className="flex items-center gap-4 text-xs font-mono text-[#8080a0]">
        <span>{entries_count} entries</span>
        <span className="text-[#2a2a4e]">·</span>
        <span>+0.9 INIT per entry</span>
      </div>

      {/* Progress bar showing pot growth */}
      <PotProgressBar pot={pot} maxPot="500000000" />
    </div>
  )
}

function PotProgressBar({ pot, maxPot }: { pot: string; maxPot: string }) {
  const pct = Math.min(100, (Number(pot) / Number(maxPot)) * 100)

  return (
    <div className="w-full max-w-xs h-1 bg-[#1a1a2e] rounded-full overflow-hidden mt-1">
      <motion.div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
          boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
        }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}
