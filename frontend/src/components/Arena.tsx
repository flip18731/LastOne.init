import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { toUtf8 } from '@cosmjs/encoding'
import { useGameState } from '../hooks/useGameState'
import { useCountdown } from '../hooks/useCountdown'
import { Countdown } from './Countdown'
import { PotDisplay } from './PotDisplay'
import { EntryFeed } from './EntryFeed'
import { AICommentator } from './AICommentator'
import { BridgeDeposit } from './BridgeDeposit'
import { displayPlayer, formatInit } from '../lib/utils'
import { CONTRACT_ADDRESS, ENTRY_FEE_UINIT, COUNTDOWN_SECONDS, CHAIN_CONFIG } from '../lib/constants'

export function Arena() {
  const { round, config, revenueStats, loading, error, refresh, triggerShake } = useGameState()
  const {
    address,
    isConnected,
    username,
    requestTxBlock,
    autoSign,
  } = useInterwovenKit()

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
    && isConnected
    && round?.last_entry_address === address

  const canEnter = isConnected && !entering && round?.status !== 'Ended'

  async function handleEnter() {
    if (!canEnter || !address) return
    setEntering(true)
    setTxError(null)

    try {
      const msg = MsgExecuteContract.fromPartial({
        sender: address,
        contract: CONTRACT_ADDRESS,
        msg: toUtf8(JSON.stringify({ enter: { username: username ?? undefined } })),
        funds: [{ denom: 'uinit', amount: String(ENTRY_FEE_UINIT) }],
      })

      await requestTxBlock({
        messages: [{ typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract', value: msg }],
        chainId: import.meta.env.VITE_CHAIN_ID || CHAIN_CONFIG.chainId,
        gas: 200_000,
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2500)
      await refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      // Ignore user rejection
      if (!msg.includes('rejected') && !msg.includes('cancel')) {
        setTxError(msg)
      }
    } finally {
      setEntering(false)
    }
  }

  async function handleClaim() {
    if (!canClaim || !address) return
    setClaiming(true)
    setTxError(null)

    try {
      const msg = MsgExecuteContract.fromPartial({
        sender: address,
        contract: CONTRACT_ADDRESS,
        msg: toUtf8(JSON.stringify({ claim_win: {} })),
        funds: [],
      })

      await requestTxBlock({
        messages: [{ typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract', value: msg }],
        chainId: import.meta.env.VITE_CHAIN_ID || CHAIN_CONFIG.chainId,
        gas: 250_000,
      })

      await refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Claim failed'
      if (!msg.includes('rejected') && !msg.includes('cancel')) {
        setTxError(msg)
      }
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

          {/* Enter / Claim Button */}
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
                  {!isConnected
                    ? 'CONNECT WALLET TO PLAY'
                    : entering
                    ? 'ENTERING...'
                    : `ENTER — 1 INIT`}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Auto-sign indicator */}
            {isConnected && autoSign.isEnabledByChain[import.meta.env.VITE_CHAIN_ID || CHAIN_CONFIG.chainId] && (
              <div className="session-indicator text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                ⚡ Auto-Signing Active
              </div>
            )}

            {/* Bridge link when not connected */}
            {isConnected && <BridgeDeposit />}

            {/* Success flash */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="text-[#00ff88] text-sm font-mono font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ✓ Entry confirmed! You&apos;re currently last!
                </motion.div>
              )}
            </AnimatePresence>

            {txError && (
              <div className="text-[#ff0066] text-xs font-mono max-w-xs text-center">{txError}</div>
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
