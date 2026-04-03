// ===== GAME STATE TYPES =====

export type RoundStatus = 'WaitingForPlayers' | 'Active' | 'Ended'

export interface Entry {
  address: string
  username: string
  timestamp: number
  entry_number: number
}

export interface Round {
  id: number
  pot: string         // in uinit (string for big numbers)
  entries_count: number
  last_entry_address: string
  last_entry_username: string
  last_entry_time: number
  countdown_end: number
  status: RoundStatus
  winner: string | null
  entries: Entry[]
}

export interface GameConfig {
  owner: string
  entry_fee: string   // in uinit
  countdown_duration: number  // seconds
  house_cut_bps: number       // basis points, e.g. 1000 = 10%
  min_entries_to_start: number
}

export interface WinnerRecord {
  address: string
  username: string
  rounds_won: number
  total_winnings: string  // in uinit
}

export interface PlayerStats {
  address: string
  username: string
  rounds_entered: number
  rounds_won: number
  total_spent: string
  total_winnings: string
  last_entry_time: number
}

export interface RevenueStats {
  total_revenue: string
  total_rounds: number
  total_entries: number
  total_pot_distributed: string
}

// ===== EVENTS =====

export interface EntryEvent {
  round_id: number
  player: string
  username: string
  entry_number: number
  pot_size: string
  countdown_end: number
  timestamp: number
}

export interface WinEvent {
  round_id: number
  winner: string
  username: string
  pot_size: string
  total_entries: number
}

// ===== WALLET / UI =====

export interface WalletState {
  address: string | null
  username: string | null  // .init username
  balance: string | null   // in uinit
  connected: boolean
}

export interface SessionState {
  active: boolean
  expires_at: number | null  // unix timestamp
}

export interface GameEvent {
  type: 'entry' | 'close_call' | 'milestone' | 'win'
  player_username: string
  pot_size: number
  countdown_remaining: number
  entry_number: number
  round_id: number
}

// ===== CONTRACT QUERIES =====

export interface QueryResponse<T> {
  data: T
}

// ===== DISPLAY HELPERS =====

export interface FormattedEntry extends Entry {
  time_ago: string
  is_new: boolean
}

export interface HistoryRound {
  id: number
  winner: string | null
  winner_username: string | null
  pot: string
  entries_count: number
  duration_seconds: number
  ended_at: number
}
