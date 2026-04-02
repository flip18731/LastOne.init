import { useEffect, useRef, useState } from 'react'
import { getSecondsRemaining } from '../lib/utils'
import { COUNTDOWN_UPDATE_INTERVAL } from '../lib/constants'

interface UseCountdownReturn {
  secondsRemaining: number
  isExpired: boolean
  isDanger: boolean       // < 10 seconds
  isCritical: boolean     // < 5 seconds
  progress: number        // 0-1, where 1 = full time, 0 = expired
}

/**
 * Client-side countdown synchronized with on-chain countdown_end timestamp.
 * Updates at 100ms intervals for smooth display.
 */
export function useCountdown(
  countdown_end: number | null,
  countdown_duration: number = 30,
): UseCountdownReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (countdown_end === null) {
      setSecondsRemaining(0)
      return
    }

    const update = () => {
      const remaining = getSecondsRemaining(countdown_end)
      setSecondsRemaining(remaining)
    }

    update()
    intervalRef.current = setInterval(update, COUNTDOWN_UPDATE_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [countdown_end])

  const isExpired = secondsRemaining <= 0
  const isDanger = secondsRemaining > 0 && secondsRemaining <= 10
  const isCritical = secondsRemaining > 0 && secondsRemaining <= 5
  const progress = countdown_end
    ? Math.max(0, Math.min(1, secondsRemaining / countdown_duration))
    : 0

  return { secondsRemaining, isExpired, isDanger, isCritical, progress }
}
