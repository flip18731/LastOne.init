import { useInterwovenKit } from '@initia/interwovenkit-react'
import { CHAIN_CONFIG } from '../lib/constants'

/**
 * Bridge deposit integration using InterwovenKit's native openDeposit.
 * Shows only when the user is connected (so they can top up before entering).
 */
export function BridgeDeposit() {
  const { isConnected, openDeposit } = useInterwovenKit()

  if (!isConnected) return null

  function handleOpenBridge() {
    openDeposit({
      denoms: ['uinit'],
      chainId: import.meta.env.VITE_CHAIN_ID || CHAIN_CONFIG.chainId,
    })
  }

  return (
    <button
      onClick={handleOpenBridge}
      className="text-xs font-mono text-[#00f0ff] hover:text-white transition-colors
        underline decoration-[rgba(0,240,255,0.4)] underline-offset-2"
    >
      Bridge INIT from any chain →
    </button>
  )
}
