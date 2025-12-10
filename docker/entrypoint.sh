# Default to mainnet unless SPACETIME_SERVER is set to "local"
SPACETIME_SERVER="${SPACETIME_SERVER:-https://maincloud.spacetimedb.com}"

setup_identity() {
  CLI_CONFIG_DIR="/root/.config/spacetime"
  CLI_CONFIG_FILE="$CLI_CONFIG_DIR/cli.toml"

  mkdir -p "$CLI_CONFIG_DIR"

  # If cli.toml already exists (from PVC), use it
  if [ -f "$CLI_CONFIG_FILE" ]; then
    echo "Using existing identity from $CLI_CONFIG_FILE"
    TOKEN=$(grep -E '^\s*token\s*=' "$CLI_CONFIG_FILE" | head -1 | cut -d'"' -f2)
    if [ -n "$TOKEN" ]; then
      export SPACETIME_TOKEN="$TOKEN"
      echo "Identity restored: $(echo $TOKEN | cut -c1-16)..."
    fi
  else
    echo "No identity found, will generate on first publish"
  fi
}

deploy() {
  # Ignore errors,
  until (spacetime server ping "$SPACETIME_SERVER" 2>/dev/null) | grep -q "Server is online";
  do
    echo "Waiting for server to start..."
    sleep 1
  done

  read -ra module_names <<<"$MODULES"
  echo "Publishing ${#module_names[@]} modules"
  for module in "${module_names[@]}"
  do
    echo "$module"

    # Retry publish with exponential backoff
    MAX_RETRIES=5
    RETRY=0
    BACKOFF=1

    echo "Publishing $module..."
    while [ $RETRY -lt $MAX_RETRIES ]; do
      if spacetime publish --bin-path /app/pogly.wasm --server "$SPACETIME_SERVER" "$module" 2>&1; then
        echo "Successfully published $module"
        break
      fi

      RETRY=$((RETRY + 1))
      if [ $RETRY -lt $MAX_RETRIES ]; then
        echo "Publish failed (attempt $RETRY/$MAX_RETRIES), retrying in ${BACKOFF}s..."
        sleep $BACKOFF
        BACKOFF=$((BACKOFF * 2))
      else
        echo "Publish failed after $MAX_RETRIES attempts"
        exit 1
      fi
    done

    # Initialize config with OIDC only for the first "pogly" module
    if [ "$module" = "pogly" ] && [ -n "$OIDC_ISSUER" ] && [ -n "$OIDC_CLIENT_ID" ]; then
      # Check if config is already initialized
      CONFIG_INIT=$(spacetime sql --server "$SPACETIME_SERVER" "$module" "SELECT ConfigInit FROM Config" 2>/dev/null | grep -o "true\|false" | head -1)

      if [ "$CONFIG_INIT" = "true" ]; then
        echo "Config already initialized, skipping SetConfig"
      else
        echo "Initializing database with OIDC config..."

        # Retry SetConfig with exponential backoff
        RETRY=0
        BACKOFF=1
        while [ $RETRY -lt $MAX_RETRIES ]; do
          if spacetime call --server "$SPACETIME_SERVER" "$module" SetConfig \
            "${STREAM_PLATFORM:-twitch}" \
            "${STREAM_NAME:-bobross}" \
            "${DEBUG_MODE:-false}" \
            120 \
            200 \
            "${USE_PASSWORD:-false}" \
            "${STRICT_MODE:-false}" \
            "${PASSWORD:-}" \
            "$OIDC_ISSUER" \
            "$OIDC_CLIENT_ID" 2>&1; then
            echo "SetConfig succeeded"
            break
          fi

          RETRY=$((RETRY + 1))
          if [ $RETRY -lt $MAX_RETRIES ]; then
            echo "SetConfig failed (attempt $RETRY/$MAX_RETRIES), retrying in ${BACKOFF}s..."
            sleep $BACKOFF
            BACKOFF=$((BACKOFF * 2))
          else
            echo "SetConfig failed after $MAX_RETRIES attempts"
            echo "Container cannot start without proper configuration"
            exit 1
          fi
        done
      fi
    fi
  done
}

# Kill all parallel processes below
trap "kill 0" SIGINT

# Clean up stale lock files
if [ -f /stdb/spacetime.pid ]; then
  PID=$(cat /stdb/spacetime.pid)
  if ! kill -0 $PID 2>/dev/null; then
    echo "Removing stale PID file for dead process $PID"
    rm -f /stdb/spacetime.pid
  else
    echo "ERROR: SpacetimeDB process $PID is still running!"
    echo "Cannot start a new instance while another is active."
    exit 1
  fi
fi

# Only remove DB lock if no process is holding it
if [ -f /stdb/control_node/control_db/db/LOCK ]; then
  echo "WARNING: Found existing database lock file"
  if [ ! -f /stdb/spacetime.pid ]; then
    echo "No PID file found, assuming stale lock - removing"
    rm -f /stdb/control_node/control_db/db/LOCK
  fi
fi
# NOTE: if you want to run >1 process sharing the same stdb storage backend, this will cause issues.

setup_identity

# Start spacetime with retry on lock failures
start_spacetime() {
  MAX_RETRIES=5
  RETRY=0
  BACKOFF=2

  while [ $RETRY -lt $MAX_RETRIES ]; do
    if spacetime start --listen-addr 0.0.0.0:3000 --data-dir /stdb 2>&1; then
      return 0
    fi

    RETRY=$((RETRY + 1))
    if [ $RETRY -lt $MAX_RETRIES ]; then
      echo "SpacetimeDB failed to start (attempt $RETRY/$MAX_RETRIES), retrying in ${BACKOFF}s..."
      rm -f /stdb/control_node/control_db/db/LOCK
      sleep $BACKOFF
      BACKOFF=$((BACKOFF * 2))
    else
      echo "SpacetimeDB failed to start after $MAX_RETRIES attempts"
      return 1
    fi
  done
}

caddy run --config /etc/caddy/Caddyfile --adapter caddyfile \
& start_spacetime \
& deploy \
&& wait
