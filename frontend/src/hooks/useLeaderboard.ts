import { useEffect, useState } from 'react'
import type { WinnerRecord } from '../types'
import { getMockLeaderboard, queryLeaderboard } from '../lib/contract'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_CONTRACT_ADDRESS

export function useLeaderboard(limit = 20) {
  const [data, setData] = useState<WinnerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const result = USE_MOCK ? getMockLeaderboard() : await queryLeaderboard(limit)
        setData(result)
        setError(null)
      } catch (err) {
        setData(getMockLeaderboard())
        setError('Showing demo data')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [limit])

  return { data, loading, error }
}
