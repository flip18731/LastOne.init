import { INIT_DECIMALS, SHORT_ADDRESS_LENGTH, UINIT_DENOM } from './constants'

// ===== FORMATTING =====

/**
 * Convert uinit to INIT display string
 * e.g. 1_500_000 -> "1.5"
 */
export function formatInit(uinit: string | number, decimals = 2): string {
  const amount = typeof uinit === 'string' ? BigInt(uinit) : BigInt(Math.floor(uinit))
  const whole = amount / BigInt(10 ** INIT_DECIMALS)
  const fraction = amount % BigInt(10 ** INIT_DECIMALS)

  if (decimals === 0) return whole.toString()

  const fractionStr = fraction.toString().padStart(INIT_DECIMALS, '0').slice(0, decimals)
  const fractionNum = parseInt(fractionStr)

  if (fractionNum === 0) return whole.toString()
  return `${whole}.${fractionStr.replace(/0+$/, '')}`
}

/**
 * Format with INIT suffix: "247.5 INIT"
 */
export function formatInitDisplay(uinit: string | number, decimals = 2): string {
  return `${formatInit(uinit, decimals)} INIT`
}

/**
 * Shorten a blockchain address for display
 * e.g. "init1abcdef...xyz"
 */
export function shortenAddress(address: string, chars = SHORT_ADDRESS_LENGTH): string {
  if (!address) return ''
  if (address.length <= chars * 2) return address
  const prefix = address.startsWith('init1') ? 'init1' : ''
  const rest = address.slice(prefix.length)
  return `${prefix}${rest.slice(0, chars)}...${rest.slice(-4)}`
}

/**
 * Display a player — prefer .init username, fallback to shortened address
 */
export function displayPlayer(address: string, username?: string | null): string {
  if (username && username.endsWith('.init')) return `@${username.replace('.init', '')}.init`
  if (username && username.length > 0) return `@${username}`
  return shortenAddress(address)
}

/**
 * Format time ago: "28s ago", "2m ago", "5h ago"
 */
export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/**
 * Format countdown seconds to MM:SS display
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins === 0) return `${secs.toString().padStart(2, '0')}`
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format large numbers with K/M suffix: 1234567 -> "1.2M"
 */
export function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

/**
 * Calculate remaining seconds from countdown_end timestamp
 */
export function getSecondsRemaining(countdown_end: number): number {
  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, countdown_end - now)
}

/**
 * Calculate house cut from entry fee
 */
export function calculateHouseCut(entry_fee: string, house_cut_bps: number): bigint {
  return (BigInt(entry_fee) * BigInt(house_cut_bps)) / BigInt(10000)
}

/**
 * Calculate pot contribution (entry_fee minus house cut)
 */
export function calculatePotContribution(entry_fee: string, house_cut_bps: number): bigint {
  const fee = BigInt(entry_fee)
  const cut = calculateHouseCut(entry_fee, house_cut_bps)
  return fee - cut
}

// ===== COIN HELPERS =====

export function uinitToCoin(amount: string) {
  return { denom: UINIT_DENOM, amount }
}

// ===== ROUND STATUS HELPERS =====

export function isRoundActive(status: string): boolean {
  return status === 'Active'
}

export function isRoundEnded(status: string): boolean {
  return status === 'Ended'
}

export function isWaitingForPlayers(status: string): boolean {
  return status === 'WaitingForPlayers'
}

// ===== DATE HELPERS =====

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ===== MISC =====

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
