#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_json_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env, Event, MessageInfo,
    Order, Response, StdResult, Uint128,
};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{
    ExecuteMsg, InstantiateMsg, QueryMsg,
    ATTR_COUNTDOWN_END, ATTR_ENTRY_NUMBER, ATTR_PLAYER, ATTR_POT_SIZE,
    ATTR_ROUND_ID, ATTR_TOTAL_ENTRIES, ATTR_USERNAME, ATTR_WINNER,
    EVENT_ENTRY, EVENT_NEW_ROUND, EVENT_WIN,
};
use crate::state::{
    Entry, GameConfig, PlayerStats, RevenueStats, Round, RoundStatus, WinnerRecord,
    CONFIG, CURRENT_ROUND, LEADERBOARD, PLAYER_STATS, REVENUE_STATS, ROUND_HISTORY,
};

const CONTRACT_NAME: &str = "crates.io:lastone";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

const DEFAULT_ENTRY_FEE: u128 = 1_000_000;     // 1 INIT
const DEFAULT_COUNTDOWN: u64 = 30;               // 30 seconds
const DEFAULT_HOUSE_CUT: u16 = 1000;            // 10%
const DEFAULT_MIN_ENTRIES: u32 = 2;
const DENOM: &str = "uinit";

// ===== INSTANTIATE =====

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let config = GameConfig {
        owner: info.sender.clone(),
        entry_fee: msg.entry_fee.unwrap_or(DEFAULT_ENTRY_FEE),
        countdown_duration: msg.countdown_duration.unwrap_or(DEFAULT_COUNTDOWN),
        house_cut_bps: msg.house_cut_bps.unwrap_or(DEFAULT_HOUSE_CUT),
        min_entries_to_start: msg.min_entries_to_start.unwrap_or(DEFAULT_MIN_ENTRIES),
    };
    CONFIG.save(deps.storage, &config)?;

    // Initialize round #1
    let round = Round {
        id: 1,
        pot: 0,
        entries_count: 0,
        last_entry_address: info.sender.clone(),
        last_entry_username: String::new(),
        last_entry_time: env.block.time.seconds(),
        countdown_end: 0,
        status: RoundStatus::WaitingForPlayers,
        winner: None,
        entries: vec![],
    };
    CURRENT_ROUND.save(deps.storage, &round)?;

    // Initialize revenue stats
    REVENUE_STATS.save(deps.storage, &RevenueStats {
        total_revenue: 0,
        total_rounds: 0,
        total_entries: 0,
        total_pot_distributed: 0,
    })?;

    Ok(Response::new()
        .add_attribute("action", "instantiate")
        .add_attribute("owner", info.sender)
        .add_attribute("entry_fee", config.entry_fee.to_string())
        .add_attribute("countdown_duration", config.countdown_duration.to_string()))
}

// ===== EXECUTE =====

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Enter { username } => execute_enter(deps, env, info, username),
        ExecuteMsg::ClaimWin {} => execute_claim_win(deps, env, info),
        ExecuteMsg::StartNewRound {} => execute_start_new_round(deps, env, info),
        ExecuteMsg::UpdateConfig {
            entry_fee,
            countdown_duration,
            house_cut_bps,
        } => execute_update_config(deps, info, entry_fee, countdown_duration, house_cut_bps),
        ExecuteMsg::WithdrawRevenue { amount } => execute_withdraw_revenue(deps, env, info, amount),
    }
}

fn execute_enter(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    username: Option<String>,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    let mut round = CURRENT_ROUND.load(deps.storage)?;

    // Validate round status
    if matches!(round.status, RoundStatus::Ended) {
        return Err(ContractError::RoundAlreadyEnded);
    }

    // Validate payment
    validate_payment(&info, config.entry_fee)?;

    // Calculate house cut and pot contribution
    let house_cut = (config.entry_fee * config.house_cut_bps as u128) / 10000;
    let pot_contribution = config.entry_fee - house_cut;

    let now = env.block.time.seconds();
    let username_str = username.unwrap_or_default();

    // Update round
    round.pot += pot_contribution;
    round.entries_count += 1;
    round.last_entry_address = info.sender.clone();
    round.last_entry_username = username_str.clone();
    round.last_entry_time = now;
    round.countdown_end = now + config.countdown_duration;

    // Transition status
    if matches!(round.status, RoundStatus::WaitingForPlayers)
        && round.entries_count >= config.min_entries_to_start
    {
        round.status = RoundStatus::Active;
    }

    // Record entry
    round.entries.push(Entry {
        address: info.sender.clone(),
        username: username_str.clone(),
        timestamp: now,
        entry_number: round.entries_count,
    });

    CURRENT_ROUND.save(deps.storage, &round)?;

    // Update revenue stats
    let mut stats = REVENUE_STATS.load(deps.storage)?;
    stats.total_entries += 1;
    stats.total_revenue += house_cut;
    REVENUE_STATS.save(deps.storage, &stats)?;

    // Update player stats
    update_player_stats(
        deps.storage,
        &info.sender,
        &username_str,
        config.entry_fee,
        now,
    )?;

    // Emit event
    let event = Event::new(EVENT_ENTRY)
        .add_attribute(ATTR_ROUND_ID, round.id.to_string())
        .add_attribute(ATTR_PLAYER, info.sender.to_string())
        .add_attribute(ATTR_USERNAME, &username_str)
        .add_attribute(ATTR_ENTRY_NUMBER, round.entries_count.to_string())
        .add_attribute(ATTR_POT_SIZE, round.pot.to_string())
        .add_attribute(ATTR_COUNTDOWN_END, round.countdown_end.to_string());

    Ok(Response::new().add_event(event))
}

fn execute_claim_win(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
) -> Result<Response, ContractError> {
    let mut round = CURRENT_ROUND.load(deps.storage)?;

    // Must be Active
    if !matches!(round.status, RoundStatus::Active) {
        return Err(ContractError::RoundNotActive {
            status: round.status.to_string(),
        });
    }

    // Countdown must have expired
    let now = env.block.time.seconds();
    if now <= round.countdown_end {
        return Err(ContractError::CountdownNotExpired {
            seconds_remaining: round.countdown_end - now,
        });
    }

    // Must be the last entrant
    if info.sender != round.last_entry_address {
        return Err(ContractError::NotLastEntrant);
    }

    let pot = round.pot;
    let winner = info.sender.clone();
    let winner_username = round.last_entry_username.clone();

    // Mark round as ended
    round.status = RoundStatus::Ended;
    round.winner = Some(winner.clone());

    // Archive this round
    ROUND_HISTORY.save(deps.storage, round.id, &round)?;
    CURRENT_ROUND.save(deps.storage, &round)?;

    // Update revenue stats
    let mut stats = REVENUE_STATS.load(deps.storage)?;
    stats.total_rounds += 1;
    stats.total_pot_distributed += pot;
    REVENUE_STATS.save(deps.storage, &stats)?;

    // Update leaderboard
    update_leaderboard(deps.storage, &winner, &winner_username, pot)?;

    // Update winner's player stats
    let mut player = PLAYER_STATS
        .may_load(deps.storage, winner.as_str())?
        .unwrap_or_else(|| PlayerStats {
            address: winner.clone(),
            username: winner_username.clone(),
            rounds_entered: 0,
            rounds_won: 0,
            total_spent: 0,
            total_winnings: 0,
            last_entry_time: 0,
        });
    player.rounds_won += 1;
    player.total_winnings += pot;
    PLAYER_STATS.save(deps.storage, winner.as_str(), &player)?;

    // Transfer pot to winner
    let send_msg = BankMsg::Send {
        to_address: winner.to_string(),
        amount: vec![Coin { denom: DENOM.to_string(), amount: Uint128::from(pot) }],
    };

    let win_event = Event::new(EVENT_WIN)
        .add_attribute(ATTR_ROUND_ID, round.id.to_string())
        .add_attribute(ATTR_WINNER, winner.to_string())
        .add_attribute(ATTR_USERNAME, &winner_username)
        .add_attribute(ATTR_POT_SIZE, pot.to_string())
        .add_attribute(ATTR_TOTAL_ENTRIES, round.entries_count.to_string());

    // Auto-start next round
    let next_round_id = round.id + 1;
    let new_round = Round {
        id: next_round_id,
        pot: 0,
        entries_count: 0,
        last_entry_address: winner.clone(),
        last_entry_username: String::new(),
        last_entry_time: now,
        countdown_end: 0,
        status: RoundStatus::WaitingForPlayers,
        winner: None,
        entries: vec![],
    };
    CURRENT_ROUND.save(deps.storage, &new_round)?;

    let new_round_event = Event::new(EVENT_NEW_ROUND)
        .add_attribute(ATTR_ROUND_ID, next_round_id.to_string());

    Ok(Response::new()
        .add_message(send_msg)
        .add_event(win_event)
        .add_event(new_round_event))
}

fn execute_start_new_round(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {
            expected: config.owner.to_string(),
        });
    }

    let current = CURRENT_ROUND.load(deps.storage)?;
    let next_id = current.id + 1;

    let new_round = Round {
        id: next_id,
        pot: 0,
        entries_count: 0,
        last_entry_address: info.sender,
        last_entry_username: String::new(),
        last_entry_time: env.block.time.seconds(),
        countdown_end: 0,
        status: RoundStatus::WaitingForPlayers,
        winner: None,
        entries: vec![],
    };
    CURRENT_ROUND.save(deps.storage, &new_round)?;

    let event = Event::new(EVENT_NEW_ROUND)
        .add_attribute(ATTR_ROUND_ID, next_id.to_string());

    Ok(Response::new().add_event(event))
}

fn execute_update_config(
    deps: DepsMut,
    info: MessageInfo,
    entry_fee: Option<u128>,
    countdown_duration: Option<u64>,
    house_cut_bps: Option<u16>,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;

    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {
            expected: config.owner.to_string(),
        });
    }

    if let Some(fee) = entry_fee { config.entry_fee = fee; }
    if let Some(dur) = countdown_duration { config.countdown_duration = dur; }
    if let Some(cut) = house_cut_bps { config.house_cut_bps = cut; }

    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new().add_attribute("action", "update_config"))
}

fn execute_withdraw_revenue(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    amount: Option<u128>,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {
            expected: config.owner.to_string(),
        });
    }

    let stats = REVENUE_STATS.load(deps.storage)?;
    let withdraw_amount = amount.unwrap_or(stats.total_revenue);

    // Query actual balance to be safe
    let balance = deps.querier.query_balance(env.contract.address, DENOM)?;
    let actual_available = balance.amount.u128()
        .saturating_sub(CURRENT_ROUND.load(deps.storage)?.pot);

    let withdraw_amount = withdraw_amount.min(actual_available);

    let send_msg = BankMsg::Send {
        to_address: config.owner.to_string(),
        amount: vec![Coin { denom: DENOM.to_string(), amount: Uint128::from(withdraw_amount) }],
    };

    Ok(Response::new()
        .add_message(send_msg)
        .add_attribute("action", "withdraw_revenue")
        .add_attribute("amount", withdraw_amount.to_string()))
}

// ===== QUERY =====

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetCurrentRound {} => to_json_binary(&CURRENT_ROUND.load(deps.storage)?),
        QueryMsg::GetRound { id } => to_json_binary(&ROUND_HISTORY.load(deps.storage, id)?),
        QueryMsg::GetLeaderboard { limit } => {
            let limit = limit.unwrap_or(10) as usize;
            let mut winners: Vec<WinnerRecord> = LEADERBOARD
                .range(deps.storage, None, None, Order::Ascending)
                .map(|r| r.map(|(_, v)| v))
                .collect::<StdResult<Vec<_>>>()?;
            winners.sort_by(|a, b| b.total_winnings.cmp(&a.total_winnings));
            winners.truncate(limit);
            to_json_binary(&winners)
        }
        QueryMsg::GetRevenueStats {} => to_json_binary(&REVENUE_STATS.load(deps.storage)?),
        QueryMsg::GetConfig {} => to_json_binary(&CONFIG.load(deps.storage)?),
        QueryMsg::GetPlayerStats { address } => {
            let addr = deps.api.addr_validate(&address)?;
            let stats = PLAYER_STATS
                .may_load(deps.storage, addr.as_str())?
                .unwrap_or_else(|| PlayerStats {
                    address: addr.clone(),
                    username: String::new(),
                    rounds_entered: 0,
                    rounds_won: 0,
                    total_spent: 0,
                    total_winnings: 0,
                    last_entry_time: 0,
                });
            to_json_binary(&stats)
        }
    }
}

// ===== HELPERS =====

fn validate_payment(info: &MessageInfo, expected: u128) -> Result<(), ContractError> {
    if info.funds.is_empty() {
        return Err(ContractError::NoFunds);
    }

    let uinit = info.funds.iter().find(|c| c.denom == DENOM);
    match uinit {
        None => Err(ContractError::WrongDenom {
            denom: info.funds[0].denom.clone(),
        }),
        Some(coin) => {
            let received = coin.amount.u128();
            if received != expected {
                Err(ContractError::IncorrectPayment { expected, received })
            } else {
                Ok(())
            }
        }
    }
}

fn update_player_stats(
    storage: &mut dyn cosmwasm_std::Storage,
    address: &cosmwasm_std::Addr,
    username: &str,
    entry_fee: u128,
    timestamp: u64,
) -> StdResult<()> {
    let mut stats = PLAYER_STATS
        .may_load(storage, address.as_str())?
        .unwrap_or_else(|| PlayerStats {
            address: address.clone(),
            username: username.to_string(),
            rounds_entered: 0,
            rounds_won: 0,
            total_spent: 0,
            total_winnings: 0,
            last_entry_time: 0,
        });

    stats.rounds_entered += 1;
    stats.total_spent += entry_fee;
    stats.last_entry_time = timestamp;
    if !username.is_empty() {
        stats.username = username.to_string();
    }

    PLAYER_STATS.save(storage, address.as_str(), &stats)
}

fn update_leaderboard(
    storage: &mut dyn cosmwasm_std::Storage,
    winner: &cosmwasm_std::Addr,
    username: &str,
    winnings: u128,
) -> StdResult<()> {
    let mut record = LEADERBOARD
        .may_load(storage, winner.as_str())?
        .unwrap_or_else(|| WinnerRecord {
            address: winner.clone(),
            username: username.to_string(),
            rounds_won: 0,
            total_winnings: 0,
        });

    record.rounds_won += 1;
    record.total_winnings += winnings;
    if !username.is_empty() {
        record.username = username.to_string();
    }

    LEADERBOARD.save(storage, winner.as_str(), &record)
}
