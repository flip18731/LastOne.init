/**
 * Wallet hook — wraps InterwovenKit's wallet state.
 * Provides connected address, .init username, and INIT balance.
 */

import { useEffect, useState } from 'react'
import type { WalletState } from '../types'
import { resolveUsername } from '../lib/contract'

// We use a simple global state + event emitter pattern here
// so all components share the same wallet state without context hell.

let globalWalletState: WalletState = {
  address: null,
  username: null,
  balance: null,
  connected: false,
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach(fn => fn())
}

export function setWalletAddress(address: string | null) {
  globalWalletState = { ...globalWalletState, address, connected: !!address }
  notify()

  if (address) {
    resolveUsername(address).then(username => {
      globalWalletState = { ...globalWalletState, username }
      notify()
    })
  } else {
    globalWalletState = { ...globalWalletState, username: null, balance: null }
  }
}

export function setWalletBalance(balance: string | null) {
  globalWalletState = { ...globalWalletState, balance }
  notify()
}

export function useWallet(): WalletState & {
  setAddress: (addr: string | null) => void
  setBalance: (bal: string | null) => void
} {
  const [state, setState] = useState<WalletState>(globalWalletState)

  useEffect(() => {
    const listener = () => setState({ ...globalWalletState })
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  return {
    ...state,
    setAddress: setWalletAddress,
    setBalance: setWalletBalance,
  }
}
