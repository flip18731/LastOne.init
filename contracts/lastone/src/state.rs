use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};

// ===== ENUMS =====

#[cw_serde]
pub enum RoundStatus {
    WaitingForPlayers,
    Active,
    Ended,
}

impl std::fmt::Display for RoundStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RoundStatus::WaitingForPlayers => write!(f, "WaitingForPlayers"),
            RoundStatus::Active => write!(f, "Active"),
            RoundStatus::Ended => write!(f, "Ended"),
        }
    }
}

// ===== STRUCTS =====

#[cw_serde]
pub struct GameConfig {
    pub owner: Addr,
    /// Entry fee in uinit (e.g. 1_000_000 = 1 INIT)
    pub entry_fee: u128,
    /// Countdown duration in seconds (e.g. 30)
    pub countdown_duration: u64,
    /// House cut in basis points (e.g. 1000 = 10%)
    pub house_cut_bps: u16,
    /// Minimum entries before countdown starts
    pub min_entries_to_start: u32,
}

#[cw_serde]
pub struct Entry {
    pub address: Addr,
    pub username: String,
    pub timestamp: u64,
    pub entry_number: u32,
}

#[cw_serde]
pub struct Round {
    pub id: u64,
    /// Current pot in uinit (after house cuts)
    pub pot: u128,
    pub entries_count: u32,
    pub last_entry_address: Addr,
    pub last_entry_username: String,
    pub last_entry_time: u64,
    /// Unix timestamp when countdown expires
    pub countdown_end: u64,
    pub status: RoundStatus,
    pub winner: Option<Addr>,
    pub entries: Vec<Entry>,
}

#[cw_serde]
pub struct WinnerRecord {
    pub address: Addr,
    pub username: String,
    pub rounds_won: u32,
    pub total_winnings: u128,
}

#[cw_serde]
pub struct PlayerStats {
    pub address: Addr,
    pub username: String,
    pub rounds_entered: u32,
    pub rounds_won: u32,
    pub total_spent: u128,
    pub total_winnings: u128,
    pub last_entry_time: u64,
}

#[cw_serde]
pub struct RevenueStats {
    pub total_revenue: u128,
    pub total_rounds: u64,
    pub total_entries: u64,
    pub total_pot_distributed: u128,
}

// ===== STORAGE KEYS =====

pub const CONFIG: Item<GameConfig> = Item::new("config");
pub const CURRENT_ROUND: Item<Round> = Item::new("current_round");
pub const REVENUE_STATS: Item<RevenueStats> = Item::new("revenue_stats");

/// Historical rounds by ID
pub const ROUND_HISTORY: Map<u64, Round> = Map::new("round_history");

/// Leaderboard: address -> WinnerRecord
pub const LEADERBOARD: Map<&str, WinnerRecord> = Map::new("leaderboard");

/// Player stats: address -> PlayerStats
pub const PLAYER_STATS: Map<&str, PlayerStats> = Map::new("player_stats");
