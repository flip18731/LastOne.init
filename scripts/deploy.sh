#!/usr/bin/env bash
set -euo pipefail

# ===================================================
# LastOne.init — Contract Deployment Script
# Deploys the CosmWasm contract to Initia testnet
# ===================================================

# Configuration — update these after appchain launch
CHAIN_ID="${CHAIN_ID:-lastone-1}"
NODE="${NODE:-https://rpc.lastone.init.testnet}"
KEY="${KEY:-deployer}"           # Key name in your local keyring
KEYRING="${KEYRING:-test}"       # or 'os' for production
GAS_PRICES="0.025uinit"
CONTRACT_DIR="$(dirname "$0")/../contracts/lastone"

echo "🚀 LastOne.init Contract Deployment"
echo "====================================="
echo "Chain ID: $CHAIN_ID"
echo "Node:     $NODE"
echo "Key:      $KEY"
echo ""

# ===== STEP 1: Build the contract =====
echo "📦 Building CosmWasm contract..."
cd "$CONTRACT_DIR"

# Optimize for production
if command -v docker &>/dev/null; then
    docker run --rm -v "$(pwd)":/code \
        --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
        --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
        cosmwasm/optimizer:0.16.0
    WASM_FILE="artifacts/lastone.wasm"
else
    # Development build (not optimized)
    cargo build --release --target wasm32-unknown-unknown
    WASM_FILE="target/wasm32-unknown-unknown/release/lastone.wasm"
fi

echo "✅ Contract built: $WASM_FILE"

# ===== STEP 2: Upload the contract =====
echo ""
echo "⬆️  Uploading contract to chain..."
UPLOAD_TX=$(initiad tx wasm store "$WASM_FILE" \
    --from "$KEY" \
    --chain-id "$CHAIN_ID" \
    --node "$NODE" \
    --gas auto \
    --gas-adjustment 1.3 \
    --gas-prices "$GAS_PRICES" \
    --keyring-backend "$KEYRING" \
    --output json \
    --broadcast-mode sync \
    -y)

UPLOAD_TXHASH=$(echo "$UPLOAD_TX" | jq -r '.txhash')
echo "✅ Upload TX: $UPLOAD_TXHASH"

# Wait for TX to be included
echo "⏳ Waiting for block inclusion..."
sleep 8

# Get code ID from TX result
CODE_ID=$(initiad query tx "$UPLOAD_TXHASH" \
    --node "$NODE" \
    --output json \
    | jq -r '.logs[0].events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')

echo "✅ Code ID: $CODE_ID"

# ===== STEP 3: Instantiate the contract =====
echo ""
echo "🔧 Instantiating contract..."

INIT_MSG=$(cat <<EOF
{
  "entry_fee": 1000000,
  "countdown_duration": 30,
  "house_cut_bps": 1000,
  "min_entries_to_start": 2
}
EOF
)

INSTANTIATE_TX=$(initiad tx wasm instantiate "$CODE_ID" "$INIT_MSG" \
    --from "$KEY" \
    --label "lastone-init-v1" \
    --admin "$(initiad keys show "$KEY" --keyring-backend "$KEYRING" -a)" \
    --chain-id "$CHAIN_ID" \
    --node "$NODE" \
    --gas auto \
    --gas-adjustment 1.3 \
    --gas-prices "$GAS_PRICES" \
    --keyring-backend "$KEYRING" \
    --output json \
    --broadcast-mode sync \
    -y)

INSTANTIATE_TXHASH=$(echo "$INSTANTIATE_TX" | jq -r '.txhash')
echo "✅ Instantiate TX: $INSTANTIATE_TXHASH"

sleep 8

# Get contract address
CONTRACT_ADDRESS=$(initiad query tx "$INSTANTIATE_TXHASH" \
    --node "$NODE" \
    --output json \
    | jq -r '.logs[0].events[] | select(.type=="instantiate") | .attributes[] | select(.key=="_contract_address") | .value')

echo ""
echo "====================================="
echo "✅ CONTRACT DEPLOYED SUCCESSFULLY"
echo "====================================="
echo "Code ID:          $CODE_ID"
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Chain ID:         $CHAIN_ID"
echo ""
echo "📝 Next steps:"
echo "1. Update VITE_CONTRACT_ADDRESS in frontend/.env"
echo "2. Update CONTRACT_ADDRESS in frontend/src/lib/constants.ts"
echo "3. Update submission.json with txn_link"
echo ""
echo "🔗 Explorer: https://explorer.testnet.initia.xyz/tx/$INSTANTIATE_TXHASH"
