<p align="center">
    <a href="https://pogly.gg#gh-dark-mode-only" target="_blank">
	<img width="128" src="./images/dark/Pog.png" alt="Pogly Logo">
    </a>
    <a href="https://pogly.gg#gh-light-mode-only" target="_blank">
	<img width="128" src="./images/light/Pog.png" alt="Pogly Logo">
    </a>
</p>
<p align="center">
    <a href="https://pogly.gg#gh-dark-mode-only" target="_blank">
        <img width="250" src="./images/dark/pogly-text.png" alt="Pogly">
    </a>
    <a href="https://pogly.gg#gh-light-mode-only" target="_blank">
        <img width="250" src="./images/light/pogly-text.png" alt="Pogly">
    </a>
    <p style="font-style: italic;line-height: 0" align="center">
        A configurable multi-user overlay for streamers
    </p>
</p>

<p align="center">
    <a href="https://github.com/microsoft/TypeScript"><img src="https://img.shields.io/badge/built_with-TypeScript-2F74C0.svg?style=flat-square"><img src="https://img.shields.io/badge/CSharp-6C287D.svg?style=flat-square" /></a>
    &nbsp;
    <a href="https://github.com/clockworklabs/spacetimedb"><img src="https://img.shields.io/badge/powered_by-SpacetimeDB-000000.svg?style=flat-square" /></a>
    &nbsp;
	<img src="https://img.shields.io/github/v/release/poglyapp/pogly-standalone?color=9f9f9f&include_prereleases&label=version&sort=semver&style=flat-square" />
    &nbsp;
    <a href="https://github.com/PoglyApp/pogly-standalone/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-50C878.svg?style=flat-square" /></a>
</p>

<p align="center">
    <a href="https://discord.gg/pogly"><img height="25" src="./images/social/discord.svg" alt="Discord" /></a>
    &nbsp;
    <a href="https://www.twitch.tv/poglygg"><img height="25" src="./images/social/twitch.svg" alt="Twitch" /></a>
    &nbsp;
    <a href="https://www.youtube.com/@PoglyApp"><img height="25" src="./images/social/youtube.svg" alt="YouTube" /></a>
    &nbsp;
    <a href="https://x.com/PoglyApp"><img height="25" src="./images/social/twitter.svg" alt="Twitter" /></a>
</p>

<br>

## What is Pogly Standalone?

Pogly is a real-time collaborative stream overlay powered by [SpacetimeDB](https://spacetimedb.com). Think Figma for your OBS overlay.

With Pogly, you can condense your cluttered OBS overlays into a single, powerful browser source. Multiple editors can add, edit, and delete overlay elements in real-time while you stream. Let your chat moderators update overlays, add emojis, or drop memes to encourage chat interaction.

[example.webm](https://github.com/PoglyApp/pogly-standalone/assets/36650721/7eb57196-bf56-4fa1-979f-36eb5c0746e9)

## Quick Start

### Using Pogly Cloud (Recommended)

The easiest way to use Pogly is through our free hosted service at [pogly.gg](https://pogly.gg). No installation required.

For setup instructions, check out the [beginner's guide](https://github.com/PoglyApp/pogly-documentation/blob/main/use/beginnerGuide.md).

### Self-Hosting with Docker

**Prerequisites:**
- Docker and Docker Compose
- OIDC provider (Authentik, Keycloak, etc.)

**Installation:**

1. Clone the repository:
```bash
git clone https://github.com/PoglyApp/pogly-standalone.git
cd pogly-standalone
```

2. Create a `.env` file:
```bash
OIDC_ISSUER=https://your-oidc-provider.com/application/o/pogly/
OIDC_CLIENT_ID=your_client_id_here
```

3. Run with Docker Compose:
```bash
docker compose up -d
```

4. Configure your OIDC provider with these redirect URIs:
   - `http://localhost/callback`
   - `http://localhost/`
   - `http://localhost/silent-oidc-renew.html`

5. Access Pogly at `http://localhost`

**Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `OIDC_ISSUER` | OIDC provider issuer URL | Required |
| `OIDC_CLIENT_ID` | OIDC client ID | Required |
| `STREAM_PLATFORM` | Streaming platform (`twitch`, `youtube`) | `twitch` |
| `STREAM_NAME` | Default channel/video ID | `bobross` |
| `MODULES` | Space-separated list of module names | `pogly` |

### Self-Hosting on Kubernetes

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Kubernetes deployment instructions with Flux GitOps.

## Configuration

After logging in via OIDC, the first user automatically becomes the owner. Access settings via the header menu to configure:

- **Stream Platform:** Twitch or YouTube
- **Stream Name:** Channel or video ID
- **Update Rate:** Overlay refresh rate (Hz)
- **Authentication:** Require authentication for editors
- **Strict Mode:** Enhanced security mode

## Architecture

- **Frontend:** React + TypeScript + Vite
- **Backend:** C# SpacetimeDB module
- **Authentication:** OIDC (OAuth 2.0)
- **Real-time sync:** SpacetimeDB WebSocket
- **Reverse proxy:** Caddy

## Support

For assistance with setup or usage, join our [Discord](https://discord.gg/pogly).

## Contributing

Check out our [contribution guidelines](./CONTRIBUTING.md).

## License

Licensed under Apache-2.0. See [LICENSE](./LICENSE) for details.
