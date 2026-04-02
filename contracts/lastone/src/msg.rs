use cosmwasm_schema::{cw_serde, QueryResponses};
use crate::state::{GameConfig, PlayerStats, RevenueStats, Round, WinnerRecord};

// ===== INSTANTIATE =====

#[cw_serde]
pub struct InstantiateMsg {
    /// Entry fee in uinit (default: 1_000_000 = 1 INIT)
    pub entry_fee: Option<u128>,
    /// Countdown duration in seconds (default: 30)
    pub countdown_duration: Option<u64>,
    /// House cut in basis points (default: 1000 = 10%)
    pub house_cut_bps: Option<u16>,
    /// Min entries to start countdown (default: 2)
    pub min_entries_to_start: Option<u32>,
}

// ===== EXECUTE =====

#[cw_serde]
pub enum ExecuteMsg {
    /// Enter the current round. Must send exact entry_fee in uinit.
    Enter {
        /// Optional .init username (resolved client-side and passed in)
        username: Option<String>,
    },
    /// Claim the win. Only callable by last_entry_address after countdown expires.
    ClaimWin {},
    /// Start a new round (owner only, or auto-called after ClaimWin)
    StartNewRound {},
    /// Update game config (owner only)
    UpdateConfig {
        entry_fee: Option<u128>,
        countdown_duration: Option<u64>,
        house_cut_bps: Option<u16>,
    },
    /// Withdraw accumulated house revenue (owner only)
    WithdrawRevenue { amount: Option<u128> },
}

// ===== QUERY =====

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(Round)]
    GetCurrentRound {},

    #[returns(Round)]
    GetRound { id: u64 },

    #[returns(Vec<WinnerRecord>)]
    GetLeaderboard { limit: Option<u32> },

    #[returns(RevenueStats)]
    GetRevenueStats {},

    #[returns(GameConfig)]
    GetConfig {},

    #[returns(PlayerStats)]
    GetPlayerStats { address: String },
}

// ===== EVENTS =====

pub const EVENT_ENTRY: &str = "lastone_entry";
pub const EVENT_WIN: &str = "lastone_win";
pub const EVENT_NEW_ROUND: &str = "lastone_new_round";

// Attribute keys
pub const ATTR_ROUND_ID: &str = "round_id";
pub const ATTR_PLAYER: &str = "player";
pub const ATTR_USERNAME: &str = "username";
pub const ATTR_ENTRY_NUMBER: &str = "entry_number";
pub const ATTR_POT_SIZE: &str = "pot_size";
pub const ATTR_COUNTDOWN_END: &str = "countdown_end";
pub const ATTR_WINNER: &str = "winner";
pub const ATTR_TOTAL_ENTRIES: &str = "total_entries";
