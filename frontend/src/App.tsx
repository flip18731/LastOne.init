import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectWallet } from './components/ConnectWallet'
import { Arena } from './components/Arena'
import { Leaderboard } from './components/Leaderboard'
import { RoundHistory } from './components/RoundHistory'
import { HowItWorks } from './components/HowItWorks'
import { RevenueStats } from './components/RevenueStats'
import { UserProfile } from './components/UserProfile'
import { useGameState } from './hooks/useGameState'
import { useWallet } from './hooks/useWallet'

// ===== PAGE LAYOUTS =====

function ArenaPage() {
  const { revenueStats } = useGameState()
  const { connected } = useWallet()

  return (
    <div className="space-y-8">
      <Arena />
      {connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserProfile />
          <RevenueStats stats={revenueStats} />
        </div>
      )}
      {!connected && <RevenueStats stats={revenueStats} />}
    </div>
  )
}

function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-mono font-black neon-text-gold">Leaderboard</h1>
      <Leaderboard limit={20} />
    </div>
  )
}

function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-mono font-black text-[#e0e0f0]">Round History</h1>
      <RoundHistory />
    </div>
  )
}

function RevenuePage() {
  const { revenueStats } = useGameState()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-black neon-text-cyan">Revenue Dashboard</h1>
        <p className="text-[#8080a0] text-sm font-mono mt-1">
          Fully transparent platform revenue. Every INIT accounted for.
        </p>
      </div>
      <RevenueStats stats={revenueStats} />
      <RevenueDashboardExtended stats={revenueStats} />
    </div>
  )
}

function RevenueDashboardExtended({ stats }: { stats: any }) {
  if (!stats) return null
  return (
    <div className="game-card">
      <div className="text-xs font-mono text-[#8080a0] tracking-widest mb-4">REVENUE BREAKDOWN</div>
      <div className="space-y-3">
        {[
          { label: 'Entry fee per player', value: '1.000 INIT', note: '100%' },
          { label: '→ Prize pool contribution', value: '0.900 INIT', note: '90%', color: '#ffd700' },
          { label: '→ House fee (platform)', value: '0.100 INIT', note: '10%', color: '#00ff88' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#1a1a2e]">
            <span className="text-sm font-mono" style={{ color: row.color || '#8080a0' }}>
              {row.label}
            </span>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-[#e0e0f0]">{row.value}</span>
              <span className="text-xs font-mono text-[#40405a] ml-2">{row.note}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[#40405a] text-xs font-mono mt-4 text-center">
        All transactions verifiable on Initia explorer · Contract auditable on-chain
      </p>
    </div>
  )
}

function HowItWorksPage() {
  return (
    <div className="space-y-6">
      <HowItWorks />
    </div>
  )
}

// ===== NAVIGATION =====

function NavBar() {
  const navLinks = [
    { to: '/', label: 'Arena', exact: true },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/history', label: 'History' },
    { to: '/revenue', label: 'Revenue' },
    { to: '/how-it-works', label: 'How It Works' },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-[#1a1a2e] bg-[rgba(10,10,15,0.95)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#ff0066]
              flex items-center justify-center text-black font-black text-sm font-mono"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            1
          </motion.div>
          <span className="font-mono font-black text-lg gradient-text-cyan-magenta hidden sm:block">
            LastOne<span className="text-[#00f0ff]">.init</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
                  isActive
                    ? 'text-[#00f0ff] bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.2)]'
                    : 'text-[#8080a0] hover:text-[#c0c0e0] hover:bg-[rgba(255,255,255,0.04)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Wallet */}
        <ConnectWallet />
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden overflow-x-auto px-4 pb-2 gap-1">
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              `shrink-0 px-3 py-1 rounded text-xs font-mono transition-all ${
                isActive
                  ? 'text-[#00f0ff] bg-[rgba(0,240,255,0.08)]'
                  : 'text-[#8080a0]'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// ===== FOOTER =====

function Footer() {
  return (
    <footer className="border-t border-[#1a1a2e] mt-16 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[#40405a] text-xs font-mono">
          LastOne.init · Built for INITIATE Hackathon · Powered by Initia
        </div>
        <div className="flex items-center gap-4 text-[#40405a] text-xs font-mono">
          <a
            href="https://docs.initia.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00f0ff] transition-colors"
          >
            Initia Docs
          </a>
          <span>·</span>
          <a
            href="https://github.com/flip18731/lastone.init"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00f0ff] transition-colors"
          >
            GitHub
          </a>
          <span>·</span>
          <Link to="/how-it-works" className="hover:text-[#00f0ff] transition-colors">
            How It Works
          </Link>
        </div>
      </div>
    </footer>
  )
}

// ===== APP =====

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen grid-bg">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div key="arena" {...pageVariants} transition={{ duration: 0.25 }}>
                    <ArenaPage />
                  </motion.div>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <motion.div key="leaderboard" {...pageVariants} transition={{ duration: 0.25 }}>
                    <LeaderboardPage />
                  </motion.div>
                }
              />
              <Route
                path="/history"
                element={
                  <motion.div key="history" {...pageVariants} transition={{ duration: 0.25 }}>
                    <HistoryPage />
                  </motion.div>
                }
              />
              <Route
                path="/revenue"
                element={
                  <motion.div key="revenue" {...pageVariants} transition={{ duration: 0.25 }}>
                    <RevenuePage />
                  </motion.div>
                }
              />
              <Route
                path="/how-it-works"
                element={
                  <motion.div key="how" {...pageVariants} transition={{ duration: 0.25 }}>
                    <HowItWorksPage />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
