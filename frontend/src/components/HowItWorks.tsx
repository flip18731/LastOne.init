import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    icon: '💸',
    title: 'Pay to Enter',
    description: 'Every player pays 1 INIT to enter the current round. The fee goes straight into the prize pool (minus 10% house cut).',
    color: '#00f0ff',
    glow: 'rgba(0,240,255,0.3)',
  },
  {
    number: '02',
    icon: '⏱️',
    title: 'Reset the Clock',
    description: 'Each entry resets the 30-second countdown timer. The game keeps going as long as players keep entering.',
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.3)',
  },
  {
    number: '03',
    icon: '🏆',
    title: 'Last One Wins All',
    description: 'When the countdown hits zero, the LAST person who entered wins the entire prize pool. No sharing. Winner takes all.',
    color: '#ff0066',
    glow: 'rgba(255,0,102,0.3)',
  },
  {
    number: '04',
    icon: '⚡',
    title: 'Dare to be Last?',
    description: 'The longer you wait, the bigger the pot — but others might outmaneuver you at the last second. Pure on-chain FOMO.',
    color: '#00ff88',
    glow: 'rgba(0,255,136,0.3)',
  },
]

export function HowItWorks() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-mono font-black text-[#e0e0f0] mb-2">
          How It Works
        </h2>
        <p className="text-[#8080a0] text-sm font-mono">
          Simple rules. Maximum FOMO. Pure on-chain gaming.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="game-card relative overflow-hidden group"
            style={{ borderColor: `${step.color}25` }}
          >
            {/* Background glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at top left, ${step.glow} 0%, transparent 60%)` }}
            />

            <div className="relative z-10">
              {/* Step number */}
              <div
                className="text-5xl font-mono font-black mb-3 opacity-20"
                style={{ color: step.color }}
              >
                {step.number}
              </div>

              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{step.icon}</span>
                <h3
                  className="font-mono font-bold text-lg"
                  style={{ color: step.color, textShadow: `0 0 15px ${step.glow}` }}
                >
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-[#8080a0] text-sm leading-relaxed font-mono">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue transparency note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="game-card text-center border-[rgba(255,215,0,0.15)]"
      >
        <div className="text-[#ffd700] font-mono text-sm mb-1">💰 Transparent Revenue</div>
        <p className="text-[#8080a0] text-xs font-mono">
          10% house fee on every entry · All revenue visible on the{' '}
          <a href="/revenue" className="text-[#00f0ff] hover:underline">Revenue Dashboard</a>
          {' '}· Built on Initia blockchain — fully auditable
        </p>
      </motion.div>
    </div>
  )
}
