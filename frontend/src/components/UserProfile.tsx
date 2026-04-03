import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { displayPlayer, formatInit, shortenAddress } from '../lib/utils'
import { CHAIN_CONFIG } from '../lib/constants'

export function UserProfile() {
  const {
    address,
    isConnected,
    username,
    autoSign,
    openWallet,
  } = useInterwovenKit()

  const chainId = import.meta.env.VITE_CHAIN_ID || CHAIN_CONFIG.chainId
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [minutesRemaining, setMinutesRemaining] = useState(0)

  const isSessionActive = autoSign.isEnabledByChain[chainId] ?? false
  const sessionExpiry = autoSign.expiredAtByChain[chainId] ?? null

  // Update minutes remaining countdown
  useEffect(() => {
    if (!isSessionActive || !sessionExpiry) {
      setMinutesRemaining(0)
      return
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((sessionExpiry.getTime() - Date.now()) / 60000))
      setMinutesRemaining(remaining)
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [isSessionActive, sessionExpiry])

  if (!isConnected) return null

  async function handleStartSession() {
    try {
      await autoSign.enable(chainId)
      setShowSessionModal(false)
    } catch (err) {
      console.error('Failed to start auto-sign session:', err)
    }
  }

  async function handleEndSession() {
    try {
      await autoSign.disable(chainId)
    } catch (err) {
      console.error('Failed to disable auto-sign:', err)
    }
  }

  return (
    <>
      <div className="game-card">
        {/* Avatar + identity */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={openWallet}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#ff0066]
              flex items-center justify-center text-sm font-bold text-black font-mono
              hover:scale-105 transition-transform"
          >
            {(username || address || '?')[0].toUpperCase()}
          </button>
          <div>
            <div className="text-[#e0e0f0] font-mono font-bold text-sm">
              {displayPlayer(address, username)}
            </div>
            <div className="text-[#40405a] text-xs font-mono">
              {shortenAddress(address)}
            </div>
          </div>
        </div>

        {/* Session status */}
        {isSessionActive ? (
          <div className="flex items-center justify-between">
            <div className="session-indicator">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span>⚡ Session Active — {minutesRemaining}min</span>
            </div>
            <button
              onClick={handleEndSession}
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
                <p className="text-[#40405a] text-xs font-mono mb-4">
                  Powered by InterwovenKit Auto-Sign — Initia native feature
                </p>
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
                    disabled={autoSign.isLoading}
                    className="flex-1 py-2 rounded-lg bg-[#00ff88] text-black font-mono font-bold text-sm
                      hover:bg-[#00cc70] transition-colors disabled:opacity-50"
                  >
                    {autoSign.isLoading ? 'Starting...' : 'Start Session'}
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
