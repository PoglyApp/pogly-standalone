import { useEffect, useState } from "react";

const CLIENT_ID = "client_030t5fnI0zvgj3KScXWDp8";
const TOKEN_URL = "https://spacetimeauth.staging.spacetimedb.com/oidc/token";
const REDIRECT_URI = `${window.location.origin}/callback`;

export const Callback = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code  = params.get("code");
        const state = params.get("state");
        const iss   = params.get("iss");

        if (!code) throw new Error("Missing authorization code.");
        if (!state) throw new Error("Missing state.");

        const storedState  = sessionStorage.getItem("oidc_state");
        const codeVerifier = sessionStorage.getItem("pkce_verifier");

        if (!storedState || state !== storedState) {
          throw new Error("State mismatch.");
        }
        if (!codeVerifier) {
          throw new Error("Missing PKCE code_verifier (session expired?).");
        }

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        });

        const res = await fetch(TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
          mode: "cors"
        });

        const text = await res.text();

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Token endpoint error ${res.status}: ${text}`);
        }

        type TokenResponse = {
          access_token: string;
          id_token?: string;
          refresh_token?: string;
          token_type: string;
          expires_in: number;
          scope?: string;
        };

        const tokens = (await res.json()) as TokenResponse;
        console.log(tokens);
        alert("check console for token log");

        // localStorage.setItem("stdbAccessToken", tokens.access_token);
        // if (tokens.id_token) localStorage.setItem("twitchIdToken", tokens.id_token);
        // if (tokens.refresh_token) localStorage.setItem("twitchRefreshToken", tokens.refresh_token);
        // localStorage.setItem("twitchTokenType", tokens.token_type);
        // localStorage.setItem("twitchTokenExpiresIn", String(tokens.expires_in));

        // sessionStorage.removeItem("oidc_state");
        // sessionStorage.removeItem("pkce_verifier");
        // history.replaceState({}, document.title, window.location.pathname);

        // window.location.href = "/";
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Authorization failed.");
      }
    })();
  }, []);

  return <p>{error ? `Login failed: ${error}` : "Processing login..."}</p>;
};
