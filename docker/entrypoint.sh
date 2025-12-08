setup_identity() {
  IDENTITY_DIR="/etc/spacetimedb"
  IDENTITY_FILE="$IDENTITY_DIR/identity"

  mkdir -p "$IDENTITY_DIR"

  if [ -f "$IDENTITY_FILE" ]; then
    echo "Using existing identity from $IDENTITY_FILE"
    export SPACETIME_IDENTITY_PATH="$IDENTITY_FILE"
  else
    echo "No identity found, generating new identity..."
    spacetime identity new --no-email > "$IDENTITY_FILE"
    echo "Identity saved to $IDENTITY_FILE"
    export SPACETIME_IDENTITY_PATH="$IDENTITY_FILE"
  fi
}

deploy() {
  # Ignore errors,
  until (spacetime server ping local 2>/dev/null) | grep -q "Server is online";
  do
    echo "Waiting for server to start..."
    sleep 1
  done

  read -ra module_names <<<"$MODULES"
  echo "Publishing ${#module_names[@]} modules"
  for module in "${module_names[@]}"
  do
    echo "$module"

    # Try to publish, if it fails due to authorization, clear and retry
    if ! spacetime publish --bin-path /app/pogly.wasm --server local "$module" 2>&1; then
      echo "Publish failed, attempting with --clear-database..."
      spacetime publish --bin-path /app/pogly.wasm --server local --clear-database "$module"
    fi

    # Initialize config with OIDC if env vars are set
    if [ -n "$OIDC_ISSUER" ] && [ -n "$OIDC_CLIENT_ID" ]; then
      echo "Initializing database with OIDC config..."
      spacetime call --server local "$module" SetConfig \
        "${STREAM_PLATFORM:-twitch}" \
        "${STREAM_NAME:-}" \
        "${DEBUG_MODE:-false}" \
        120 \
        200 \
        "${USE_PASSWORD:-false}" \
        "${STRICT_MODE:-false}" \
        "${PASSWORD:-}" \
        "$OIDC_ISSUER" \
        "$OIDC_CLIENT_ID"
    else
      echo "No OIDC configuration provided, skipping auto-init"
    fi
  done
}

# Kill all parallel processes below
trap "kill 0" SIGINT

# Clean up stale lock files
rm -f /stdb/spacetime.pid

setup_identity

caddy run --config /etc/caddy/Caddyfile --adapter caddyfile \
& spacetime start --listen-addr 0.0.0.0:3000 --data-dir /stdb \
& deploy \
&& wait