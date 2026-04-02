import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameState } from '../hooks/useGameState'
import { useWallet } from '../hooks/useWallet'
import { useSessionKey } from '../hooks/useSessionKey'
import { Countdown } from './Countdown'
import { PotDisplay } from './PotDisplay'
import { EntryFeed } from './EntryFeed'
import { AICommentator } from './AICommentator'
import { BridgeDeposit } from './BridgeDeposit'
import { buildEnterMsg, buildClaimWinMsg } from '../lib/contract'
import { useCountdown } from '../hooks/useCountdown'
import { displayPlayer, formatInit } from '../lib/utils'
import { ENTRY_FEE_UINIT, COUNTDOWN_SECONDS } from '../lib/constants'

export function Arena() {
  const { round, config, revenueStats, loading, error, refresh, triggerShake } = useGameState()
  const { address, connected, balance } = useWallet()
  const { session } = useSessionKey()
  const [entering, setEntering] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const arenaRef = useRef<HTMLDivElement>(null)

  const { isExpired } = useCountdown(
    round?.countdown_end ?? null,
    config?.countdown_duration ?? COUNTDOWN_SECONDS
  )

  const canClaim = round?.status === 'Active'
    && isExpired
    && connected
    && round?.last_entry_address === address

  const hasEnoughBalance = balance && BigInt(balance) >= BigInt(ENTRY_FEE_UINIT)
  const canEnter = connected && hasEnoughBalance && !entering && round?.status !== 'Ended'

  async function handleEnter() {
    if (!canEnter) return
    setEntering(true)
    setTxError(null)

    try {
      const msg = buildEnterMsg()
      // TODO: Execute via InterwovenKit useTx hook
      // For demo: simulate success after 1s
      await new Promise(r => setTimeout(r, 1000))

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      await refresh()
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setEntering(false)
    }
  }

  async function handleClaim() {
    if (!canClaim) return
    setClaiming(true)
    try {
      const msg = buildClaimWinMsg()
      // TODO: Execute via InterwovenKit
      await new Promise(r => setTimeout(r, 1000))
      await refresh()
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : 'Claim failed')
    } finally {
      setClaiming(false)
    }
  }

  if (loading && !round) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            className="text-4xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            ◈
          </motion.div>
          <div className="text-[#8080a0] font-mono text-sm">Connecting to chain...</div>
        </div>
      </div>
    )
  }

  const r = round!

  return (
    <div
      ref={arenaRef}
      className={`relative ${triggerShake ? 'shake' : ''}`}
    >
      {/* Error banner */}
      {error && (
        <div className="mb-4 py-2 px-4 rounded-lg bg-[rgba(255,215,0,0.08)] border border-[rgba(255,215,0,0.2)]
          text-[#ffd700] text-xs font-mono text-center">
          ⚠ {error}
        </div>
      )}

      {/* Round info bar */}
      <div className="flex items-center justify-between mb-6 py-2 px-4 rounded-lg
        bg-[#0f0f1a] border border-[#1a1a2e]">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#8080a0]">Round</span>
          <span className="text-[#00f0ff] font-bold">#{r.id}</span>
          <span className="text-[#2a2a4e]">·</span>
          <span className="text-[#8080a0]">{r.entries_count} Entries</span>
          <span className="text-[#2a2a4e]">·</span>
          <StatusBadge status={r.status} />
        </div>
        {r.last_entry_username && (
          <div className="text-xs font-mono text-[#8080a0] hidden md:block">
            Last: <span className="text-[#00f0ff]">{displayPlayer(r.last_entry_address, r.last_entry_username)}</span>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Center: Countdown + Enter */}
        <div className="lg:col-span-2 space-y-6">

          {/* Countdown + Pot */}
          <div className="game-card inset-glow">
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
              <Countdown
                countdown_end={r.countdown_end}
                status={r.status}
                countdown_duration={config?.countdown_duration ?? COUNTDOWN_SECONDS}
              />
              <div className="w-px h-32 bg-[#1a1a2e] hidden md:block" />
              <PotDisplay pot={r.pot} entries_count={r.entries_count} />
            </div>
          </div>

          {/* Enter Button */}
          <div className="flex flex-col items-center gap-3">
            <AnimatePresence mode="wait">
              {canClaim ? (
                <motion.button
                  key="claim"
                  onClick={handleClaim}
                  disabled={claiming}
                  className="enter-button"
                  style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {claiming ? 'CLAIMING...' : `🏆 CLAIM ${formatInit(r.pot, 1)} INIT`}
                </motion.button>
              ) : (
                <motion.button
                  key="enter"
                  onClick={handleEnter}
                  disabled={!canEnter}
                  className="enter-button"
                  whileHover={canEnter ? { scale: 1.03 } : {}}
                  whileTap={canEnter ? { scale: 0.97 } : {}}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {!connected
                    ? 'CONNECT WALLET TO PLAY'
                    : entering
                    ? 'ENTERING...'
                    : !hasEnoughBalance
                    ? 'INSUFFICIENT BALANCE'
                    : `ENTER — 1 INIT`}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Session indicator */}
            {session.active && (
              <div className="session-indicator text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                ⚡ Auto-Signing Active
              </div>
            )}

            {/* Bridge link */}
            {connected && !hasEnoughBalance && <BridgeDeposit />}

            {/* Success flash */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="text-[#00ff88] text-sm font-mono font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ✓ Entry confirmed! You're currently last!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {txError && (
              <div className="text-[#ff0066] text-xs font-mono">{txError}</div>
            )}
          </div>

          {/* AI Commentator */}
          <AICommentator
            entry_count={r.entries_count}
            pot={r.pot}
            countdown_remaining={Math.max(0, r.countdown_end - Math.floor(Date.now() / 1000))}
            round_id={r.id}
            last_username={r.last_entry_username}
            status={r.status}
          />
        </div>

        {/* Right: Entry Feed */}
        <div className="lg:row-span-2 min-h-[400px]">
          <EntryFeed
            entries={r.entries}
            last_entry_address={r.last_entry_address}
          />
        </div>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Active') return <span className="badge-active">ACTIVE</span>
  if (status === 'WaitingForPlayers') return <span className="badge-waiting">WAITING</span>
  return <span className="badge-ended">ENDED</span>
}
