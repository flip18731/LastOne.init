import { useState } from 'react'
import { useWallet, setWalletAddress } from '../hooks/useWallet'
import { shortenAddress, displayPlayer } from '../lib/utils'

/**
 * Wallet connect button using InterwovenKit.
 * Falls back to a simple mock connection for demo mode.
 */
export function ConnectWallet() {
  const { address, username, balance, connected } = useWallet()
  const [showMenu, setShowMenu] = useState(false)

  // Mock connect for demo — replace with InterwovenKit ConnectButton in production
  function handleMockConnect() {
    const mockAddr = 'init1' + Math.random().toString(36).slice(2, 10) + 'demo'
    setWalletAddress(mockAddr)
  }

  function handleDisconnect() {
    setWalletAddress(null)
    setShowMenu(false)
  }

  if (!connected) {
    return (
      <button
        onClick={handleMockConnect}
        className="relative overflow-hidden px-5 py-2 rounded-lg font-mono font-bold text-sm
          text-[#00f0ff] border border-[rgba(0,240,255,0.4)]
          bg-[rgba(0,240,255,0.06)] hover:bg-[rgba(0,240,255,0.12)]
          transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]
          group"
      >
        <span className="relative z-10">CONNECT WALLET</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.05)] to-transparent
          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm
          bg-[#0f0f1a] border border-[rgba(0,240,255,0.2)]
          hover:border-[rgba(0,240,255,0.4)] transition-all duration-200"
      >
        {/* Green connected dot */}
        <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88,0_0_12px_#00ff88] animate-pulse" />
        <span className="text-[#00f0ff]">
          {displayPlayer(address!, username)}
        </span>
        {balance && (
          <span className="text-[#80809a] text-xs">
            {parseFloat(balance) > 0
              ? `${(parseInt(balance) / 1_000_000).toFixed(2)} INIT`
              : '0 INIT'}
          </span>
        )}
        <span className="text-[#40405a] text-xs">▾</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f0f1a] border border-[#1a1a2e] rounded-lg
          shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a1a2e]">
            <div className="text-[#8080a0] text-xs mb-1">CONNECTED AS</div>
            <div className="text-[#00f0ff] text-sm font-mono">{displayPlayer(address!, username)}</div>
            <div className="text-[#40405a] text-xs mt-1 font-mono">{shortenAddress(address!)}</div>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-3 text-left text-sm text-[#ff0066] hover:bg-[rgba(255,0,102,0.08)]
              transition-colors font-mono"
          >
            DISCONNECT
          </button>
        </div>
      )}

      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}
    </div>
  )
}
