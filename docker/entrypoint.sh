deploy() {
  # Ignore errors,
  until (spacetime server ping -s local 2>/dev/null) | grep -q "Server is online";
  do
    echo "Waiting for server to start..."
    sleep 1
  done

  read -ra module_names <<<"$MODULES"
  echo "Publishing ${#module_names[@]} modules"
  for module in "${module_names[@]}"
  do
    echo "$module"
    spacetime publish -w /app/pogly.wasm -s local "$module"
  done
}

# Kill all parallel processes below
trap "kill 0" SIGINT

caddy run --config /etc/caddy/Caddyfile --adapter caddyfile \
& spacetimedb start --listen-addr 0.0.0.0:3000 /stdb \
& deploy \
&& wait