# 🎯 LastOne.init — The Last One Standing Wins Everything

> A reverse-auction game on its own Initia appchain where the last person
> to enter before the countdown expires wins the entire pot.

[![Built on Initia](https://img.shields.io/badge/Built%20on-Initia-00f0ff?style=flat-square)](https://initia.xyz)
[![InterwovenKit](https://img.shields.io/badge/Wallet-InterwovenKit-ff0066?style=flat-square)](https://github.com/initia-labs/interwovenkit)
[![AI Powered](https://img.shields.io/badge/AI-Claude%20API-ffd700?style=flat-square)](https://anthropic.com)

---

## 🎮 How It Works

| Step | Action | Effect |
|------|--------|--------|
| 1 | Player pays **1 INIT** to enter | Fee added to prize pool (90%) + house cut (10%) |
| 2 | **Countdown resets** to 30 seconds | Every entry extends the game |
| 3 | If **no new entry** comes in 30s | Round ends |
| 4 | **Last entrant wins** the entire pot | Winner takes all, no sharing |

The longer the round goes, the bigger the pot — the bigger the FOMO.
This creates a pure **game-theory battle** between patience and fear of losing.

---

## 🏗️ Built With Initia — All Three Native Features

### 1. ⚡ Auto-Signing / Session UX
Players can start a **1-hour gaming session** after their initial wallet connection.
All subsequent `Enter` transactions are signed automatically — no wallet popup per entry.
This is critical for fast gameplay where every second counts.

### 2. 🌉 Interwoven Bridge
Players low on INIT can bridge from any chain in the Initia ecosystem directly
from within the game UI. The bridge modal appears automatically when a player
doesn't have enough balance to enter.

### 3. 👤 Initia Usernames (.init)
Every player is displayed by their `.init` username throughout the game:
- Live entry feed: `@whale.init entered • #47 • 3s ago`
- Leaderboard: ranked by `.init` username
- Winner announcement: `@degen.init wins 247 INIT!`
- Falls back to shortened address if no `.init` name registered

---

## 💰 Revenue Model

Every entry generates revenue for the appchain — fully transparent:

```
1 INIT entry fee
├── 0.90 INIT → Prize pool (90%)
└── 0.10 INIT → House fee / platform revenue (10%)
```

**Revenue sources:**
- 10% house fee on every entry (CosmWasm contract enforced)
- All transaction fees on the dedicated LastOne.init appchain
- Transparent `/revenue` dashboard shows all-time stats

---

## 🤖 AI Commentator

Powered by **Claude API** (`claude-sonnet-4-20250514`), the AI commentator generates
live, exciting commentary for key game events:

- **Every 5th entry** — running commentary on the current state
- **Close calls** (< 5s remaining) — dramatic play-by-play
- **Pot milestones** (50, 100, 200, 500 INIT) — celebration commentary
- **Win events** — winner announcement with context

Example comments:
> *"CLOSE CALL! @whale.init enters with 2 seconds left — ice cold! 🧊"*
> *"The pot just crossed 100 INIT! This is the biggest round of the week! 🔥"*
> *"AND THAT'S IT! @degen.init outlasted 47 players. Legendary. 👑"*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | CosmWasm (Rust) on Initia Rollup |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Animations | Framer Motion |
| Wallet | `@initia/interwovenkit-react` |
| State | Zustand + React hooks |
| Charts | Recharts |
| AI | Anthropic Claude API |
| Build | Vite |
| Deploy | Vercel (frontend) + Initia Testnet (contract) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Rust + `wasm32-unknown-unknown` target (for contract build)
- `initiad` CLI (for deployment)

### Frontend Development

```bash
cd frontend
npm install
cp .env.example .env    # Configure env vars
npm run dev             # Starts on http://localhost:3000
```

**Environment Variables** (`.env`):
```
VITE_CHAIN_ID=lastone-1
VITE_RPC_URL=https://rpc.lastone.init.testnet
VITE_REST_URL=https://rest.lastone.init.testnet
VITE_CONTRACT_ADDRESS=init1...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_USE_MOCK=true   # Set to false when contract is deployed
```

### Contract Build & Deploy

```bash
# Build (requires Docker for production-optimized build)
cd contracts/lastone
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source=lastone_cache,target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.16.0

# Or development build
cargo build --release --target wasm32-unknown-unknown

# Run tests
cargo test

# Deploy to testnet
CHAIN_ID=lastone-1 KEY=deployer bash scripts/deploy.sh
```

---

## 📁 Repository Structure

```
LastOne.init/
├── .initia/
│   └── submission.json          # Hackathon submission metadata
├── contracts/
│   └── lastone/
│       ├── src/
│       │   ├── contract.rs      # Main contract logic
│       │   ├── state.rs         # On-chain state definitions
│       │   ├── msg.rs           # Messages & entry points
│       │   ├── error.rs         # Custom errors
│       │   ├── tests.rs         # Unit tests (9 scenarios)
│       │   └── lib.rs
│       └── Cargo.toml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Arena.tsx        # Main game view
│   │   │   ├── Countdown.tsx    # Animated SVG countdown ring
│   │   │   ├── PotDisplay.tsx   # Pot with growth animation
│   │   │   ├── EntryFeed.tsx    # Live entry feed
│   │   │   ├── AICommentator.tsx # Claude-powered commentary
│   │   │   ├── ConnectWallet.tsx # InterwovenKit wallet button
│   │   │   ├── BridgeDeposit.tsx # Interwoven Bridge modal
│   │   │   ├── UserProfile.tsx  # .init username + session key
│   │   │   ├── Leaderboard.tsx  # All-time winners
│   │   │   ├── RoundHistory.tsx # Past rounds
│   │   │   ├── HowItWorks.tsx   # Onboarding / rules
│   │   │   └── RevenueStats.tsx # Transparency dashboard
│   │   ├── hooks/
│   │   │   ├── useGameState.ts  # Polling game state
│   │   │   ├── useCountdown.ts  # Client-side countdown sync
│   │   │   ├── useWallet.ts     # Wallet state
│   │   │   ├── useSessionKey.ts # Auto-signing session
│   │   │   └── useLeaderboard.ts
│   │   ├── lib/
│   │   │   ├── contract.ts      # Contract queries & executes
│   │   │   ├── ai-commentator.ts # Claude API integration
│   │   │   ├── constants.ts     # Chain config, game params
│   │   │   └── utils.ts         # Formatting, time helpers
│   │   └── types/index.ts       # TypeScript types
│   ├── tailwind.config.ts       # Neon theme config
│   └── package.json
├── scripts/
│   ├── deploy.sh                # Contract deployment
│   └── seed-round.sh            # Test round seeding
└── README.md
```

---

## 🎨 Design Language

**"Neon Arcade meets Bloomberg Terminal"**

- **Background**: `#0a0a0f` with subtle scanline texture
- **Primary**: Electric Cyan `#00f0ff` — countdown, data
- **Secondary**: Hot Magenta `#ff0066` — enter button, alerts
- **Accent**: Gold `#ffd700` — pot display, winners
- **Font**: JetBrains Mono — all numbers and data
- **Glow effects**: CSS text-shadow + box-shadow neon glows
- **Animations**: Framer Motion for all state transitions
- **Screen shake**: On each new entry (intensity scales with countdown urgency)

---

## 🧪 Test Coverage

The CosmWasm contract includes 9 unit tests covering:

1. ✅ Contract instantiation and initial state
2. ✅ Entry increments pot correctly (minus house cut)
3. ✅ Countdown starts after `min_entries_to_start`
4. ✅ Each entry resets the countdown timer
5. ✅ ClaimWin fails before countdown expiry
6. ✅ ClaimWin fails for non-last-entrant
7. ✅ Successful win claim transfers pot and starts new round
8. ✅ House cut calculation (10% of entry fee)
9. ✅ Leaderboard updates after win

---

## 📹 Demo Video

> [Link will be added after recording]

**Demo walkthrough:**
1. Connect wallet via InterwovenKit
2. Start a gaming session (auto-signing)
3. Enter the game (pay 1 INIT)
4. Watch countdown reset + pot grow
5. AI commentator reacts to entries
6. Countdown expires → claim win
7. Revenue dashboard shows accumulated fees

---

## 🏆 Hackathon Track

**Gaming + AI + DeFi** — LastOne.init sits at the intersection of:
- **Gaming**: Pure skill/psychology game with on-chain mechanics
- **AI**: Live Claude-powered commentary enhances the experience
- **DeFi**: Real money, transparent revenue, on-chain settlement

The reverse-auction mechanic is novel in the on-chain gaming space.
Combined with Initia's native features (session keys, bridge, usernames),
this is a complete, production-ready gaming dApp on its own appchain.

---

## 📄 License

MIT — built for the INITIATE Hackathon

---

*LastOne.init — Are you brave enough to be last?*
