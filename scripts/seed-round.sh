#!/usr/bin/env bash
set -euo pipefail

# ===================================================
# LastOne.init — Seed a test round with fake entries
# ===================================================

CONTRACT="${CONTRACT_ADDRESS:-init1...}"
CHAIN_ID="${CHAIN_ID:-lastone-1}"
NODE="${NODE:-https://rpc.lastone.init.testnet}"
KEYRING="${KEYRING:-test}"
GAS_PRICES="0.025uinit"

PLAYERS=("alice" "bob" "charlie" "diana" "eve")

echo "🌱 Seeding test round for $CONTRACT"
echo ""

for player in "${PLAYERS[@]}"; do
    echo "➡️  $player entering..."
    initiad tx wasm execute "$CONTRACT" \
        '{"enter":{"username":"'"$player"'.init"}}' \
        --amount 1000000uinit \
        --from "$player" \
        --chain-id "$CHAIN_ID" \
        --node "$NODE" \
        --gas auto \
        --gas-adjustment 1.3 \
        --gas-prices "$GAS_PRICES" \
        --keyring-backend "$KEYRING" \
        --broadcast-mode sync \
        -y
    sleep 3
done

echo ""
echo "✅ Round seeded with ${#PLAYERS[@]} entries"
echo "💰 Expected pot: $(echo "${#PLAYERS[@]} * 900000" | bc) uinit"
echo "⏱️  Countdown: 30 seconds from last entry"
