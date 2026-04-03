import { motion, AnimatePresence } from 'framer-motion'
import { useCountdown } from '../hooks/useCountdown'
import { formatCountdown } from '../lib/utils'

interface CountdownProps {
  countdown_end: number | null
  status: string
  countdown_duration?: number
}

export function Countdown({ countdown_end, status, countdown_duration = 30 }: CountdownProps) {
  const { secondsRemaining, isExpired, isDanger, isCritical, progress } = useCountdown(
    countdown_end,
    countdown_duration
  )

  const isWaiting = status === 'WaitingForPlayers'
  const isEnded = status === 'Ended' || isExpired

  // Determine color and glow based on state
  const getCountdownClass = () => {
    if (isEnded) return 'text-[#4040608]'
    if (isCritical) return 'countdown-danger'
    if (isDanger) return 'countdown-active'
    return 'countdown-active'
  }

  const getTimeDisplay = () => {
    if (isWaiting) return 'WAIT'
    if (isEnded) return '00'
    return formatCountdown(secondsRemaining)
  }

  // Progress ring color
  const ringColor = isCritical ? '#ff0066' : isDanger ? '#ff6600' : '#00f0ff'
  const ringGlow = isCritical
    ? 'drop-shadow(0 0 8px #ff0066)'
    : isDanger
    ? 'drop-shadow(0 0 8px #ff6600)'
    : 'drop-shadow(0 0 8px #00f0ff)'

  const circumference = 2 * Math.PI * 80  // r=80
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Label */}
      <div className="text-[#8080a0] text-xs font-mono tracking-[0.2em] uppercase">
        {isWaiting ? 'Waiting for Players' : isEnded ? 'Round Ended' : 'Countdown'}
      </div>

      {/* Timer with SVG ring */}
      <div className="relative flex items-center justify-center w-52 h-52">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="rgba(0, 240, 255, 0.08)"
            strokeWidth="4"
          />
          {!isWaiting && !isEnded && (
            <motion.circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: ringGlow }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          )}
        </svg>

        {/* Number display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={Math.floor(secondsRemaining)}
            className={`countdown-display text-7xl font-mono font-black ${getCountdownClass()}`}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {getTimeDisplay()}
          </motion.div>
        </AnimatePresence>

        {/* Danger pulsing overlay when critical */}
        {isCritical && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'radial-gradient(circle, rgba(255,0,102,0.3), transparent 70%)' }}
          />
        )}
      </div>

      {/* Status line */}
      <div className="flex items-center gap-2">
        {!isWaiting && !isEnded && (
          <>
            <span className={`glow-dot ${isCritical ? 'bg-[#ff0066] shadow-[0_0_6px_#ff0066]' : 'glow-dot-green'}`} />
            <span className="text-xs font-mono text-[#8080a0]">
              {isCritical ? 'CRITICAL' : isDanger ? 'DANGER ZONE' : 'LIVE'}
            </span>
          </>
        )}
        {isWaiting && (
          <>
            <span className="glow-dot bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
            <span className="text-xs font-mono text-[#ffd700]">WAITING FOR PLAYERS</span>
          </>
        )}
        {isEnded && (
          <>
            <span className="glow-dot bg-[#ff0066] shadow-[0_0_6px_#ff0066]" />
            <span className="text-xs font-mono text-[#ff0066]">ROUND ENDED</span>
          </>
        )}
      </div>
    </div>
  )
}
