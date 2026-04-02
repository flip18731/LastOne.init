/**
 * Contract interaction layer for LastOne.init
 * Handles all queries and executes against the CosmWasm contract.
 *
 * In demo/testnet mode, falls back to mock data when contract is not yet deployed.
 */

import type { GameConfig, HistoryRound, PlayerStats, RevenueStats, Round, WinnerRecord } from '../types'
import { CONTRACT_ADDRESS, CHAIN_CONFIG, ENTRY_FEE_UINIT } from './constants'

// ===== REST API HELPERS =====

async function queryContract<T>(queryMsg: object): Promise<T> {
  const encoded = btoa(JSON.stringify(queryMsg))
  const url = `${CHAIN_CONFIG.restUrl}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encoded}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Contract query failed: ${res.status}`)
  const json = await res.json()
  return json.data as T
}

// ===== QUERY FUNCTIONS =====

export async function queryCurrentRound(): Promise<Round> {
  return queryContract<Round>({ get_current_round: {} })
}

export async function queryRound(id: number): Promise<Round> {
  return queryContract<Round>({ get_round: { id } })
}

export async function queryLeaderboard(limit = 10): Promise<WinnerRecord[]> {
  return queryContract<WinnerRecord[]>({ get_leaderboard: { limit } })
}

export async function queryRevenueStats(): Promise<RevenueStats> {
  return queryContract<RevenueStats>({ get_revenue_stats: {} })
}

export async function queryConfig(): Promise<GameConfig> {
  return queryContract<GameConfig>({ get_config: {} })
}

export async function queryPlayerStats(address: string): Promise<PlayerStats> {
  return queryContract<PlayerStats>({ get_player_stats: { address } })
}

// ===== EXECUTE MESSAGE BUILDERS =====
// These return the msg object to be used with InterwovenKit's useTx hook

export function buildEnterMsg() {
  return {
    contractAddress: CONTRACT_ADDRESS,
    msg: { enter: {} },
    funds: [{ denom: 'uinit', amount: String(ENTRY_FEE_UINIT) }],
  }
}

export function buildClaimWinMsg() {
  return {
    contractAddress: CONTRACT_ADDRESS,
    msg: { claim_win: {} },
    funds: [],
  }
}

export function buildStartNewRoundMsg() {
  return {
    contractAddress: CONTRACT_ADDRESS,
    msg: { start_new_round: {} },
    funds: [],
  }
}

// ===== USERNAME RESOLUTION =====

const usernameCache = new Map<string, string | null>()

/**
 * Resolve .init username for an address.
 * Returns null if no username registered.
 */
export async function resolveUsername(address: string): Promise<string | null> {
  if (usernameCache.has(address)) return usernameCache.get(address) ?? null

  try {
    // Initia name service resolution
    const url = `${INITIA_REST}/initia/mstaking/v1/name/${address}`
    const res = await fetch(url)
    if (!res.ok) {
      usernameCache.set(address, null)
      return null
    }
    const data = await res.json()
    const username = data?.name || null
    usernameCache.set(address, username)
    return username
  } catch {
    usernameCache.set(address, null)
    return null
  }
}

const INITIA_REST = 'https://rest.initiation-2.initia.xyz'

/**
 * Batch resolve usernames for multiple addresses
 */
export async function resolveUsernames(addresses: string[]): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>()
  await Promise.all(
    addresses.map(async (addr) => {
      const username = await resolveUsername(addr)
      results.set(addr, username)
    })
  )
  return results
}

// ===== MOCK DATA (for demo / pre-deployment) =====

export function getMockRound(): Round {
  const now = Math.floor(Date.now() / 1000)
  return {
    id: 42,
    pot: '234500000',         // 234.5 INIT
    entries_count: 47,
    last_entry_address: 'init1abcdef1234567890abcdef1234567890abcd',
    last_entry_username: 'degen.init',
    last_entry_time: now - 8,
    countdown_end: now + 22,
    status: 'Active',
    winner: null,
    entries: generateMockEntries(47),
  }
}

export function getMockLeaderboard(): WinnerRecord[] {
  return [
    { address: 'init1aaa', username: 'whale.init', rounds_won: 7, total_winnings: '1234000000' },
    { address: 'init1bbb', username: 'degen.init', rounds_won: 5, total_winnings: '987000000' },
    { address: 'init1ccc', username: 'gm.init', rounds_won: 4, total_winnings: '654000000' },
    { address: 'init1ddd', username: 'based.init', rounds_won: 3, total_winnings: '543000000' },
    { address: 'init1eee', username: 'ngmi.init', rounds_won: 2, total_winnings: '234000000' },
    { address: 'init1fff', username: 'ser.init', rounds_won: 2, total_winnings: '198000000' },
    { address: 'init1ggg', username: 'giga.init', rounds_won: 1, total_winnings: '145000000' },
    { address: 'init1hhh', username: 'anon.init', rounds_won: 1, total_winnings: '98000000' },
  ]
}

export function getMockRevenueStats(): RevenueStats {
  return {
    total_revenue: '47200000',    // 47.2 INIT
    total_rounds: 42,
    total_entries: 847,
    total_pot_distributed: '762000000',  // 762 INIT
  }
}

export function getMockConfig(): GameConfig {
  return {
    owner: 'init1owner',
    entry_fee: '1000000',
    countdown_duration: 30,
    house_cut_bps: 1000,
    min_entries_to_start: 2,
  }
}

function generateMockEntries(count: number) {
  const names = ['whale.init', 'degen.init', 'gm.init', 'based.init', 'ngmi.init', 'ser.init', 'anon.init']
  const now = Math.floor(Date.now() / 1000)
  return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
    address: `init1mock${i}`,
    username: names[i % names.length],
    timestamp: now - (count - i) * 15,
    entry_number: count - i,
  })).reverse()
}

export function getMockHistoryRounds(): HistoryRound[] {
  const now = Math.floor(Date.now() / 1000)
  return Array.from({ length: 10 }, (_, i) => ({
    id: 41 - i,
    winner: `init1winner${i}`,
    winner_username: ['whale.init', 'degen.init', 'gm.init', 'based.init', 'ngmi.init'][i % 5],
    pot: String((15 + Math.random() * 200).toFixed(0) + '000000'),
    entries_count: Math.floor(10 + Math.random() * 80),
    duration_seconds: Math.floor(120 + Math.random() * 600),
    ended_at: now - (i + 1) * 3600,
  }))
}
