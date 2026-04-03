import { useInterwovenKit } from '@initia/interwovenkit-react'
import { shortenAddress, displayPlayer } from '../lib/utils'

/**
 * Wallet connect button using InterwovenKit.
 * Uses the real useInterwovenKit hook for connect/disconnect/wallet UI.
 */
export function ConnectWallet() {
  const {
    address,
    isConnected,
    username,
    openConnect,
    openWallet,
  } = useInterwovenKit()

  if (!isConnected) {
    return (
      <button
        onClick={openConnect}
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

  // When connected, clicking opens the InterwovenKit wallet panel
  return (
    <button
      onClick={openWallet}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm
        bg-[#0f0f1a] border border-[rgba(0,240,255,0.2)]
        hover:border-[rgba(0,240,255,0.4)] transition-all duration-200"
    >
      {/* Green connected dot */}
      <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88,0_0_12px_#00ff88] animate-pulse" />
      <span className="text-[#00f0ff]">
        {displayPlayer(address, username)}
      </span>
      <span className="text-[#40405a] text-xs">▾</span>
    </button>
  )
}
