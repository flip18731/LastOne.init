import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00f0ff',
        'neon-magenta': '#ff0066',
        'neon-gold': '#ffd700',
        'neon-green': '#00ff88',
        'dark-bg': '#0a0a0f',
        'dark-card': '#0f0f1a',
        'dark-border': '#1a1a2e',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Cabinet Grotesk"', 'Satoshi', 'Inter', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pulse_scale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        glow_pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        slide_in: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        flip_up: {
          '0%': { transform: 'rotateX(90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        countdown_pulse: {
          '0%, 100%': { transform: 'scale(1)', textShadow: '0 0 20px #00f0ff, 0 0 40px #00f0ff' },
          '50%': { transform: 'scale(1.05)', textShadow: '0 0 40px #00f0ff, 0 0 80px #00f0ff, 0 0 120px #00f0ff' },
        },
        danger_pulse: {
          '0%, 100%': { transform: 'scale(1)', textShadow: '0 0 20px #ff0066, 0 0 40px #ff0066' },
          '50%': { transform: 'scale(1.08)', textShadow: '0 0 40px #ff0066, 0 0 80px #ff0066, 0 0 120px #ff0066' },
        },
        pot_grow: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        entry_flash: {
          '0%': { backgroundColor: 'rgba(0, 240, 255, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        shake_strong: 'shake 0.3s ease-in-out infinite',
        pulse_scale: 'pulse_scale 0.6s ease-in-out',
        glow_pulse: 'glow_pulse 2s ease-in-out infinite',
        slide_in: 'slide_in 0.4s ease-out',
        countdown_pulse: 'countdown_pulse 1s ease-in-out infinite',
        danger_pulse: 'danger_pulse 0.5s ease-in-out infinite',
        pot_grow: 'pot_grow 0.5s ease-out',
        entry_flash: 'entry_flash 0.8s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      backgroundImage: {
        'scanlines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.015) 2px, rgba(0, 240, 255, 0.015) 4px)',
        'grid-pattern': 'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
        'neon-magenta': '0 0 20px rgba(255, 0, 102, 0.5), 0 0 40px rgba(255, 0, 102, 0.3)',
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
