/**
 * Thin wrapper around useInterwovenKit for components
 * that only need basic wallet state (address, connected).
 * Use useInterwovenKit() directly for full functionality.
 */
export { useInterwovenKit as useWallet } from '@initia/interwovenkit-react'
