#[cfg(test)]
mod tests {
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, Addr, BankMsg, CosmosMsg};

    use crate::contract::{execute, instantiate, query};
    use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
    use crate::state::{Round, RoundStatus};

    const DENOM: &str = "uinit";
    const ENTRY_FEE: u128 = 1_000_000;

    fn setup(deps: &mut cosmwasm_std::OwnedDeps<
        cosmwasm_std::MemoryStorage,
        cosmwasm_std::testing::MockApi,
        cosmwasm_std::testing::MockQuerier,
    >) {
        let info = mock_info("owner", &[]);
        let msg = InstantiateMsg {
            entry_fee: Some(ENTRY_FEE),
            countdown_duration: Some(30),
            house_cut_bps: Some(1000),
            min_entries_to_start: Some(2),
        };
        instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
    }

    #[test]
    fn test_instantiate() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        let round: Round = cosmwasm_std::from_json(
            query(deps.as_ref(), mock_env(), QueryMsg::GetCurrentRound {}).unwrap()
        ).unwrap();

        assert_eq!(round.id, 1);
        assert_eq!(round.pot, 0);
        assert!(matches!(round.status, RoundStatus::WaitingForPlayers));
    }

    #[test]
    fn test_enter_increments_pot() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        // Player 1 enters
        let info = mock_info("player1", &coins(ENTRY_FEE, DENOM));
        execute(deps.as_mut(), mock_env(), info, ExecuteMsg::Enter {
            username: Some("degen.init".to_string()),
        }).unwrap();

        let round: Round = cosmwasm_std::from_json(
            query(deps.as_ref(), mock_env(), QueryMsg::GetCurrentRound {}).unwrap()
        ).unwrap();

        // Pot should be entry_fee - house_cut = 1_000_000 - 100_000 = 900_000
        assert_eq!(round.pot, 900_000);
        assert_eq!(round.entries_count, 1);
        assert_eq!(round.last_entry_username, "degen.init");
        // Still waiting (need 2 entries)
        assert!(matches!(round.status, RoundStatus::WaitingForPlayers));
    }

    #[test]
    fn test_countdown_starts_after_min_entries() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        let info1 = mock_info("player1", &coins(ENTRY_FEE, DENOM));
        execute(deps.as_mut(), mock_env(), info1, ExecuteMsg::Enter { username: None }).unwrap();

        let info2 = mock_info("player2", &coins(ENTRY_FEE, DENOM));
        execute(deps.as_mut(), mock_env(), info2, ExecuteMsg::Enter { username: None }).unwrap();

        let round: Round = cosmwasm_std::from_json(
            query(deps.as_ref(), mock_env(), QueryMsg::GetCurrentRound {}).unwrap()
        ).unwrap();

        assert!(matches!(round.status, RoundStatus::Active));
        assert_eq!(round.entries_count, 2);
        // Pot = 2 * 900_000 = 1_800_000
        assert_eq!(round.pot, 1_800_000);
    }

    #[test]
    fn test_countdown_resets_on_entry() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        let mut env = mock_env();
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1000);

        // Two entries to start countdown
        execute(deps.as_mut(), env.clone(), mock_info("p1", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();
        execute(deps.as_mut(), env.clone(), mock_info("p2", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();

        // Advance time by 20 seconds
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1020);

        // New entry should reset countdown to now + 30 = 1050
        execute(deps.as_mut(), env.clone(), mock_info("p3", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();

        let round: Round = cosmwasm_std::from_json(
            query(deps.as_ref(), env.clone(), QueryMsg::GetCurrentRound {}).unwrap()
        ).unwrap();

        assert_eq!(round.countdown_end, 1020 + 30);
        assert_eq!(round.last_entry_address, Addr::unchecked("p3"));
    }

    #[test]
    fn test_claim_win_before_expiry_fails() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        let mut env = mock_env();
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1000);

        execute(deps.as_mut(), env.clone(), mock_info("p1", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();
        execute(deps.as_mut(), env.clone(), mock_info("p2", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();

        // Try to claim while countdown still running (at t=1015, expires at t=1030)
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1015);
        let err = execute(deps.as_mut(), env, mock_info("p2", &[]),
            ExecuteMsg::ClaimWin {}).unwrap_err();

        assert!(matches!(err, crate::error::ContractError::CountdownNotExpired { .. }));
    }

    #[test]
    fn test_claim_win_wrong_address_fails() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        let mut env = mock_env();
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1000);

        execute(deps.as_mut(), env.clone(), mock_info("p1", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();
        execute(deps.as_mut(), env.clone(), mock_info("p2", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();

        // After expiry
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1031);

        // p1 tries to claim, but p2 was last
        let err = execute(deps.as_mut(), env, mock_info("p1", &[]),
            ExecuteMsg::ClaimWin {}).unwrap_err();

        assert!(matches!(err, crate::error::ContractError::NotLastEntrant));
    }

    #[test]
    fn test_successful_claim_win() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        let mut env = mock_env();
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1000);

        execute(deps.as_mut(), env.clone(), mock_info("p1", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: Some("winner.init".to_string()) }).unwrap();
        execute(deps.as_mut(), env.clone(), mock_info("winner", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: Some("winner.init".to_string()) }).unwrap();

        // After expiry
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1031);

        let res = execute(deps.as_mut(), env.clone(), mock_info("winner", &[]),
            ExecuteMsg::ClaimWin {}).unwrap();

        // Should have a BankMsg::Send for the pot
        let bank_msgs: Vec<_> = res.messages.iter()
            .filter_map(|m| {
                if let CosmosMsg::Bank(BankMsg::Send { to_address, amount }) = &m.msg {
                    Some((to_address, amount))
                } else {
                    None
                }
            })
            .collect();

        assert_eq!(bank_msgs.len(), 1);
        assert_eq!(bank_msgs[0].0, "winner");
        assert_eq!(bank_msgs[0].1[0].amount.u128(), 1_800_000); // 2 * 900_000

        // New round should be started (round 2)
        let round: Round = cosmwasm_std::from_json(
            query(deps.as_ref(), env, QueryMsg::GetCurrentRound {}).unwrap()
        ).unwrap();
        assert_eq!(round.id, 2);
        assert!(matches!(round.status, RoundStatus::WaitingForPlayers));
    }

    #[test]
    fn test_house_cut_calculation() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        execute(deps.as_mut(), mock_env(), mock_info("p1", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();

        let stats: crate::state::RevenueStats = cosmwasm_std::from_json(
            query(deps.as_ref(), mock_env(), QueryMsg::GetRevenueStats {}).unwrap()
        ).unwrap();

        // 10% of 1_000_000 = 100_000
        assert_eq!(stats.total_revenue, 100_000);
        assert_eq!(stats.total_entries, 1);
    }

    #[test]
    fn test_wrong_payment_fails() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        // Wrong amount
        let err = execute(
            deps.as_mut(), mock_env(),
            mock_info("p1", &coins(500_000, DENOM)), // half the fee
            ExecuteMsg::Enter { username: None }
        ).unwrap_err();

        assert!(matches!(err, crate::error::ContractError::IncorrectPayment { .. }));

        // Wrong denom
        let err = execute(
            deps.as_mut(), mock_env(),
            mock_info("p1", &coins(ENTRY_FEE, "uatom")),
            ExecuteMsg::Enter { username: None }
        ).unwrap_err();

        assert!(matches!(err, crate::error::ContractError::WrongDenom { .. }));
    }

    #[test]
    fn test_leaderboard_updates_after_win() {
        let mut deps = mock_dependencies();
        setup(&mut deps);

        let mut env = mock_env();
        env.block.time = cosmwasm_std::Timestamp::from_seconds(1000);

        execute(deps.as_mut(), env.clone(), mock_info("p1", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: None }).unwrap();
        execute(deps.as_mut(), env.clone(), mock_info("champ", &coins(ENTRY_FEE, DENOM)),
            ExecuteMsg::Enter { username: Some("champ.init".to_string()) }).unwrap();

        env.block.time = cosmwasm_std::Timestamp::from_seconds(1031);
        execute(deps.as_mut(), env, mock_info("champ", &[]),
            ExecuteMsg::ClaimWin {}).unwrap();

        let leaderboard: Vec<crate::state::WinnerRecord> = cosmwasm_std::from_json(
            query(deps.as_ref(), mock_env(), QueryMsg::GetLeaderboard { limit: Some(10) }).unwrap()
        ).unwrap();

        assert_eq!(leaderboard.len(), 1);
        assert_eq!(leaderboard[0].address, Addr::unchecked("champ"));
        assert_eq!(leaderboard[0].rounds_won, 1);
        assert_eq!(leaderboard[0].total_winnings, 1_800_000);
    }
}
