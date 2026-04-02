import { useWallet } from '../hooks/useWallet'
import { useSessionKey } from '../hooks/useSessionKey'
import { displayPlayer, formatInit } from '../lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function UserProfile() {
  const { address, username, balance, connected } = useWallet()
  const { session, startSession, endSession, minutesRemaining } = useSessionKey()
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [starting, setStarting] = useState(false)

  if (!connected) return null

  async function handleStartSession() {
    setStarting(true)
    try {
      await startSession()
      setShowSessionModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setStarting(false)
    }
  }

  return (
    <>
      <div className="game-card">
        {/* Username / Address */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#ff0066]
            flex items-center justify-center text-sm font-bold text-black font-mono">
            {(username || address || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="text-[#e0e0f0] font-mono font-bold text-sm">
              {displayPlayer(address!, username)}
            </div>
            <div className="text-[#40405a] text-xs font-mono">
              {balance ? `${formatInit(balance, 2)} INIT` : '— INIT'}
            </div>
          </div>
        </div>

        {/* Session status */}
        {session.active ? (
          <div className="flex items-center justify-between">
            <div className="session-indicator">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span>⚡ Session Active — {minutesRemaining}min</span>
            </div>
            <button
              onClick={endSession}
              className="text-xs text-[#40405a] hover:text-[#ff0066] transition-colors font-mono"
            >
              End
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSessionModal(true)}
            className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold
              border border-[rgba(0,255,136,0.3)] text-[#00ff88]
              bg-[rgba(0,255,136,0.05)] hover:bg-[rgba(0,255,136,0.1)]
              transition-all duration-200 flex items-center justify-center gap-2"
          >
            ⚡ Start Gaming Session
          </button>
        )}
      </div>

      {/* Session modal */}
      <AnimatePresence>
        {showSessionModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSessionModal(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                w-full max-w-sm mx-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="game-card neon-border-green p-6">
                <h3 className="text-[#00ff88] font-mono font-bold text-lg mb-2">
                  ⚡ Start Gaming Session
                </h3>
                <p className="text-[#8080a0] text-sm mb-4 leading-relaxed">
                  Enable <span className="text-[#e0e0f0]">instant entries</span> for 1 hour.
                  No wallet popup for every transaction — just one-click entries.
                </p>
                <div className="space-y-2 mb-5">
                  {[
                    'Auto-sign entry transactions',
                    'No wallet popup per entry',
                    'Valid for 60 minutes',
                    'Revoke anytime',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[#c0c0e0] font-mono">
                      <span className="text-[#00ff88]">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSessionModal(false)}
                    className="flex-1 py-2 rounded-lg border border-[#2a2a4e] text-[#8080a0]
                      hover:border-[#4a4a6e] transition-colors font-mono text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartSession}
                    disabled={starting}
                    className="flex-1 py-2 rounded-lg bg-[#00ff88] text-black font-mono font-bold text-sm
                      hover:bg-[#00cc70] transition-colors disabled:opacity-50"
                  >
                    {starting ? 'Starting...' : 'Start Session'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
