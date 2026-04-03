/**
 * AI Commentator powered by Claude API
 * Generates live, exciting game commentary for key events.
 *
 * NOTE: In production, route through a backend proxy to protect the API key.
 * For the hackathon demo, we use VITE_ANTHROPIC_API_KEY env var.
 */

import type { GameEvent } from '../types'
import { FALLBACK_COMMENTS } from './constants'
import { randomFrom } from './utils'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

const SYSTEM_PROMPT = `You are an excited, witty sports commentator for an on-chain game called LastOne.init.
The game: players pay 1 INIT to enter, each entry resets a 30-second countdown, and the LAST person to enter before the countdown expires wins the entire pot.
Your comments are short (1-2 sentences max), energetic, and use gaming/crypto slang.
Comment in English. Use emojis sparingly but effectively (1-2 per comment).
Be extremely dramatic for close calls (countdown < 5 seconds).
Be impressed and hyped for large pots (> 100 INIT).
Make word plays with "last" and "one" occasionally.
Mention the player's username when available.
Keep it under 120 characters.`

export async function generateAIComment(event: GameEvent): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    return getFallbackComment(event.type)
  }

  const userPrompt = buildPrompt(event)

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      console.warn('AI commentator API error:', res.status)
      return getFallbackComment(event.type)
    }

    const data = await res.json()
    return data.content?.[0]?.text ?? getFallbackComment(event.type)
  } catch (err) {
    console.warn('AI commentator failed, using fallback:', err)
    return getFallbackComment(event.type)
  }
}

function buildPrompt(event: GameEvent): string {
  const lines = [
    `Event type: ${event.type}`,
    `Player: ${event.player_username || 'anonymous'}`,
    `Current pot: ${event.pot_size} INIT`,
    `Countdown remaining: ${event.countdown_remaining}s`,
    `Entry number: #${event.entry_number} in Round #${event.round_id}`,
  ]

  if (event.type === 'close_call') {
    lines.push('This was an EXTREMELY close call — entered with almost no time left!')
  }
  if (event.type === 'milestone') {
    lines.push(`Pot hit a milestone: ${event.pot_size} INIT`)
  }
  if (event.type === 'win') {
    lines.push('The countdown just expired! This player just WON the entire pot!')
  }

  lines.push('Generate one short, exciting commentary line.')
  return lines.join('\n')
}

function getFallbackComment(type: GameEvent['type']): string {
  const comments = FALLBACK_COMMENTS[type] ?? FALLBACK_COMMENTS.entry
  return randomFrom(comments)
}

// ===== TRIGGER LOGIC =====

export function shouldTriggerComment(
  entry_number: number,
  countdown_remaining: number,
  pot_init: number,
  is_win: boolean,
  prevPotInit: number,
): GameEvent['type'] | null {
  if (is_win) return 'win'

  // Close call: entered with < 5 seconds remaining
  if (countdown_remaining < 5) return 'close_call'

  // Pot milestone crossed
  const milestones = [50, 100, 200, 500, 1000]
  for (const m of milestones) {
    if (prevPotInit < m && pot_init >= m) return 'milestone'
  }

  // Every 5th entry
  if (entry_number % 5 === 0) return 'entry'

  return null
}
