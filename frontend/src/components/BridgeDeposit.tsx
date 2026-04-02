import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../hooks/useWallet'
import { formatInit } from '../lib/utils'
import { ENTRY_FEE_UINIT } from '../lib/constants'

export function BridgeDeposit() {
  const { balance } = useWallet()
  const [showModal, setShowModal] = useState(false)

  const hasEnoughBalance = balance && BigInt(balance) >= BigInt(ENTRY_FEE_UINIT)

  if (hasEnoughBalance) return null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs font-mono text-[#00f0ff] hover:text-white transition-colors
          underline decoration-[rgba(0,240,255,0.4)] underline-offset-2"
      >
        Not enough INIT? Bridge from any chain →
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="game-card neon-border-cyan p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#00f0ff] font-mono font-bold text-lg">
                    Interwoven Bridge
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-[#40405a] hover:text-white transition-colors font-mono"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[#8080a0] text-sm mb-5">
                  Bridge INIT from any chain in the Initia ecosystem to start playing.
                </p>

                {/* Balance display */}
                {balance && (
                  <div className="bg-[#0a0a0f] rounded-lg p-3 mb-4 border border-[#1a1a2e]">
                    <div className="text-[#40405a] text-xs font-mono mb-1">YOUR BALANCE</div>
                    <div className="text-[#e0e0f0] font-mono font-bold">
                      {formatInit(balance, 2)} INIT
                    </div>
                    <div className="text-[#ff0066] text-xs font-mono mt-1">
                      Need {formatInit(String(ENTRY_FEE_UINIT), 0)} INIT to play
                    </div>
                  </div>
                )}

                {/* Bridge options */}
                <div className="space-y-2 mb-5">
                  <p className="text-[#8080a0] text-xs font-mono uppercase tracking-wider mb-3">
                    Bridge from:
                  </p>
                  {[
                    { name: 'Initia Mainnet', icon: '◈', badge: 'Recommended' },
                    { name: 'Ethereum', icon: '⟠', badge: null },
                    { name: 'Celestia', icon: '◉', badge: null },
                    { name: 'Other Minitias', icon: '◆', badge: null },
                  ].map(chain => (
                    <a
                      key={chain.name}
                      href="https://app.initia.xyz/bridge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg
                        bg-[#0a0a0f] border border-[#1a1a2e]
                        hover:border-[rgba(0,240,255,0.3)] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#00f0ff] text-lg">{chain.icon}</span>
                        <span className="text-[#c0c0e0] font-mono text-sm">{chain.name}</span>
                        {chain.badge && (
                          <span className="badge-active">{chain.badge}</span>
                        )}
                      </div>
                      <span className="text-[#40405a] group-hover:text-[#00f0ff] transition-colors">
                        →
                      </span>
                    </a>
                  ))}
                </div>

                <p className="text-[#40405a] text-xs font-mono text-center">
                  Powered by Interwoven Bridge · Initia Ecosystem
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
