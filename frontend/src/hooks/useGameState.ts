import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameConfig, RevenueStats, Round, WinnerRecord } from '../types'
import {
  getMockConfig,
  getMockLeaderboard,
  getMockRevenueStats,
  getMockRound,
  queryConfig,
  queryCurrentRound,
  queryLeaderboard,
  queryRevenueStats,
} from '../lib/contract'
import { GAME_STATE_POLL_INTERVAL } from '../lib/constants'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_CONTRACT_ADDRESS

interface GameState {
  round: Round | null
  config: GameConfig | null
  leaderboard: WinnerRecord[]
  revenueStats: RevenueStats | null
  loading: boolean
  error: string | null
  lastUpdated: number
}

interface UseGameStateReturn extends GameState {
  refresh: () => Promise<void>
  triggerShake: boolean
  clearShake: () => void
}

export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>({
    round: null,
    config: null,
    leaderboard: [],
    revenueStats: null,
    loading: true,
    error: null,
    lastUpdated: 0,
  })

  const [triggerShake, setTriggerShake] = useState(false)
  const prevEntriesRef = useRef<number>(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchState = useCallback(async () => {
    try {
      let round: Round
      let config: GameConfig
      let leaderboard: WinnerRecord[]
      let revenueStats: RevenueStats

      if (USE_MOCK) {
        // Simulate live data with slight variations in mock
        round = getMockRound()
        config = getMockConfig()
        leaderboard = getMockLeaderboard()
        revenueStats = getMockRevenueStats()
      } else {
        ;[round, config, leaderboard, revenueStats] = await Promise.all([
          queryCurrentRound(),
          queryConfig(),
          queryLeaderboard(10),
          queryRevenueStats(),
        ])
      }

      // Detect new entry → trigger shake
      if (prevEntriesRef.current > 0 && round.entries_count > prevEntriesRef.current) {
        setTriggerShake(true)
        setTimeout(() => setTriggerShake(false), 600)
      }
      prevEntriesRef.current = round.entries_count

      setState({
        round,
        config,
        leaderboard,
        revenueStats,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      })
    } catch (err) {
      console.error('Failed to fetch game state:', err)
      // On error, fall back to mock data
      setState(prev => ({
        ...prev,
        round: prev.round ?? getMockRound(),
        config: prev.config ?? getMockConfig(),
        leaderboard: prev.leaderboard.length ? prev.leaderboard : getMockLeaderboard(),
        revenueStats: prev.revenueStats ?? getMockRevenueStats(),
        loading: false,
        error: USE_MOCK ? null : 'Could not connect to chain — showing demo data',
      }))
    }
  }, [])

  useEffect(() => {
    fetchState()
    pollRef.current = setInterval(fetchState, GAME_STATE_POLL_INTERVAL)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchState])

  return {
    ...state,
    refresh: fetchState,
    triggerShake,
    clearShake: () => setTriggerShake(false),
  }
}
