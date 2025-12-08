# OIDC Integration Testing

Automated tests for Pogly's OIDC authentication implementation.

## Quick Test

```bash
./test/test-build.sh
```

This will:
1. Build the Pogly Docker image with OIDC support
2. Start Pogly in a container
3. Verify the web UI is accessible
4. Verify the module compiled with OIDC configuration fields
5. Check for compilation errors

## What's Tested

### Automated
- ✅ Mock OIDC provider starts and serves `.well-known/openid-configuration`
- ✅ Pogly container builds and starts successfully
- ✅ Web UI is accessible
- ✅ JWT tokens can be obtained from OIDC provider
- ✅ Module binary includes OIDC configuration fields
- ✅ Module deploys without errors

### Manual (requires SpacetimeDB CLI)
- Setting OIDC config via `UpdateOidcConfig` reducer
- Connecting with JWT authentication
- Verifying JWT validation against issuer/audience

## Test Environment

The test spins up:

**Mock OIDC Provider** (`ghcr.io/navikt/mock-oauth2-server`)
- Port: 8080
- Issuer: `http://localhost:8080/default`
- Client ID: `pogly-test-client`
- Test user: `testuser` (preferred_username)

**Pogly Instance**
- Port: 80
- Module name: `pogly-test`
- Fresh database (volume removed on cleanup)

## Full Manual Test Flow

### 1. Start Test Environment

```bash
cd test
docker-compose -f docker-compose.test.yml up -d
```

### 2. Get Test JWT

```bash
curl -X POST http://localhost:8080/default/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=pogly-test-client" \
  -d "scope=openid profile"
```

Save the `access_token` from the response.

### 3. Configure SpacetimeDB CLI (if installed)

```bash
# Add to ~/.spacetime/config.toml
cat >> ~/.spacetime/config.toml << 'EOF'

[[server_configs]]
name = "pogly-test"
host = "http://localhost:3000"
protocol = "http"

[server_configs.oidc_config]
issuer = "http://localhost:8080/default"
client_id = "pogly-test-client"
EOF
```

### 4. Initialize Pogly Config

```bash
docker-compose -f docker-compose.test.yml exec pogly spacetime call pogly-test SetConfig \
  "twitch" \
  "testchannel" \
  false \
  120 \
  200 \
  false \
  false \
  "test-key" \
  "http://mockoidc:8080/default" \
  "pogly-test-client"
```

Note: Uses `http://mockoidc:8080/default` (internal Docker network) not `localhost:8080`

### 5. Test OIDC Config Update

```bash
docker-compose -f docker-compose.test.yml exec pogly spacetime call pogly-test UpdateOidcConfig \
  "http://mockoidc:8080/default" \
  "pogly-test-client"
```

### 6. Cleanup

```bash
docker-compose -f docker-compose.test.yml down -v
```

## Testing Against Real Authentik

Edit `docker-compose.test.yml` to remove `mockoidc` service and update Pogly config:

```bash
docker-compose -f docker-compose.test.yml exec pogly spacetime call pogly-test UpdateOidcConfig \
  "https://authentik.dragonfruit.dev/application/o/pogly/" \
  "your-real-client-id"
```

Then test with real authentication flow.

## Troubleshooting

### Mock OIDC won't start
```bash
docker-compose -f docker-compose.test.yml logs mockoidc
```

Check port 8080 isn't already in use.

### Pogly won't build
```bash
docker-compose -f docker-compose.test.yml logs pogly
```

The Dockerfile builds both the C# module and React frontend.

### Module not deploying
```bash
docker-compose -f docker-compose.test.yml exec pogly spacetime server list
```

Check if `pogly-test` appears in the list.

### JWT validation fails

Check the issuer URL:
- From outside container: `http://localhost:8080/default`
- From inside container: `http://mockoidc:8080/default`

Use the internal URL when configuring Pogly.

## CI/CD Integration

Add to your GitHub Actions:

```yaml
- name: Run OIDC Integration Tests
  run: |
    chmod +x test/test-oidc.sh
    ./test/test-oidc.sh
```

Requires Docker and docker-compose.
