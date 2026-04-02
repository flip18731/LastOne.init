/**
 * Session Key hook — enables Auto-Signing for one-click entries.
 * Implements the Initia session key pattern for gasless/popup-free transactions.
 */

import { useEffect, useState } from 'react'
import type { SessionState } from '../types'

const SESSION_DURATION_SECONDS = 3600  // 1 hour

interface UseSessionKeyReturn {
  session: SessionState
  startSession: () => Promise<void>
  endSession: () => void
  minutesRemaining: number
}

export function useSessionKey(): UseSessionKeyReturn {
  const [session, setSession] = useState<SessionState>(() => {
    // Restore from localStorage
    try {
      const stored = localStorage.getItem('lastone_session')
      if (stored) {
        const parsed: SessionState = JSON.parse(stored)
        if (parsed.active && parsed.expires_at && parsed.expires_at > Date.now() / 1000) {
          return parsed
        }
      }
    } catch {}
    return { active: false, expires_at: null }
  })

  const [minutesRemaining, setMinutesRemaining] = useState(0)

  // Countdown timer for session expiry display
  useEffect(() => {
    if (!session.active || !session.expires_at) {
      setMinutesRemaining(0)
      return
    }

    const update = () => {
      const remaining = session.expires_at! - Math.floor(Date.now() / 1000)
      if (remaining <= 0) {
        endSession()
      } else {
        setMinutesRemaining(Math.ceil(remaining / 60))
      }
    }

    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [session])

  async function startSession() {
    // In production: call InterwovenKit's session key creation
    // For now: simulate session creation with a timestamp
    try {
      // TODO: Replace with actual InterwovenKit session key API
      // const sessionKey = await interwovenKit.createSessionKey({
      //   duration: SESSION_DURATION_SECONDS,
      //   allowedMsgs: ['wasm/MsgExecuteContract'],
      // })

      const expires_at = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
      const newSession: SessionState = { active: true, expires_at }
      setSession(newSession)
      localStorage.setItem('lastone_session', JSON.stringify(newSession))
    } catch (err) {
      console.error('Failed to start session:', err)
      throw err
    }
  }

  function endSession() {
    const newSession: SessionState = { active: false, expires_at: null }
    setSession(newSession)
    localStorage.removeItem('lastone_session')
  }

  return { session, startSession, endSession, minutesRemaining }
}
