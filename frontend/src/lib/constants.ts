// ===== CHAIN CONFIG =====
// These will be updated after appchain deployment

export const CHAIN_CONFIG = {
  chainId: 'lastone-1',         // Update after deployment
  chainName: 'LastOne.init',
  rpcUrl: 'https://rpc.lastone.init.testnet',   // Update after deployment
  restUrl: 'https://rest.lastone.init.testnet', // Update after deployment
  bech32Prefix: 'init',
  feeDenom: 'uinit',
  stakeDenom: 'uinit',
  gasPrice: '0.025uinit',
}

// Parent chain (Initia testnet)
export const INITIA_TESTNET = {
  chainId: 'initiation-2',
  rpcUrl: 'https://rpc.initiation-2.initia.xyz',
  restUrl: 'https://rest.initiation-2.initia.xyz',
}

// ===== CONTRACT CONFIG =====
export const CONTRACT_ADDRESS = 'init1...'  // Update after deployment

// ===== GAME CONSTANTS =====
export const ENTRY_FEE_UINIT = 1_000_000     // 1 INIT = 1,000,000 uinit
export const ENTRY_FEE_DISPLAY = '1 INIT'
export const HOUSE_CUT_BPS = 1000            // 10%
export const COUNTDOWN_SECONDS = 30
export const MIN_ENTRIES_TO_START = 2

// ===== DISPLAY =====
export const UINIT_DENOM = 'uinit'
export const INIT_DECIMALS = 6
export const SHORT_ADDRESS_LENGTH = 8        // chars to show: init1ab...xyz

// ===== AI COMMENTATOR =====
export const AI_COMMENT_EVERY_N_ENTRIES = 5
export const AI_COMMENT_CLOSE_CALL_THRESHOLD = 5  // seconds
export const AI_COMMENT_POT_MILESTONES = [50, 100, 200, 500, 1000]  // INIT

// ===== POLLING =====
export const GAME_STATE_POLL_INTERVAL = 3000  // ms
export const COUNTDOWN_UPDATE_INTERVAL = 100  // ms (smooth countdown)

// ===== FALLBACK AI COMMENTS =====
export const FALLBACK_COMMENTS: Record<string, string[]> = {
  entry: [
    "Another one enters the arena! Who will be last? 🎯",
    "The pot grows. The countdown resets. Who's next? ⚡",
    "Every entry is a bet — will this be the LAST ONE? 🔥",
    "They dared to enter. The clock is ticking... ⏱️",
    "WAGMI? Or just this one? The countdown restarts! 💀",
  ],
  close_call: [
    "CLOSE CALL! They entered with barely any time left! 😱",
    "MILLISECONDS. That's how close we are to a winner! 🚨",
    "Ice cold move! Entering at the last second! 🧊",
    "THE NERVES OF STEEL! Entering when the clock is almost zero! 💎",
    "That was INSANE! One more entry and it resets again... 🌀",
  ],
  milestone: [
    "The pot is MASSIVE! This round is historic! 🏆",
    "We're looking at life-changing money on chain! 💰",
    "The pot size is giving everyone FOMO! Who's brave enough? 😤",
    "This is the biggest pot of the season! Don't miss out! 🎰",
    "ENORMOUS pot! The stakes have never been higher! 🚀",
  ],
  win: [
    "WE HAVE A WINNER! The last one standing claims the throne! 👑",
    "VICTORY! They outlasted everyone. The pot is theirs! 🏆",
    "LEGENDARY! The last entry wins it all! Pure on-chain glory! 🌟",
    "AND THAT'S IT! The final entry claims the entire pot! 🎊",
    "THE LAST ONE STANDING! They'll remember this round forever! 💫",
  ],
}
