import type { UserManagerSettings } from "oidc-client-ts";
import { WebStorageStateStore } from "oidc-client-ts";

const issuer = (process.env.OIDC_ISSUER ?? "").trim();
const clientId = (process.env.OIDC_CLIENT_ID ?? "").trim();

export const oidcEnabled = issuer.length > 0 && clientId.length > 0;

const baseUrl = (() => {
  const raw = import.meta.env.BASE_URL ?? "/";
  const trimmed = (raw ?? "/").trim();
  if (trimmed === "/") return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
})();

const origin = window.location.origin;

export const oidcConfig: UserManagerSettings = {
  authority: issuer,
  client_id: clientId,

  redirect_uri: `${origin}${baseUrl}/callback`,
  post_logout_redirect_uri: `${origin}${baseUrl}/`,
  silent_redirect_uri: `${origin}${baseUrl}/silent-oidc-renew.html`,

  scope: "openid profile email",
  response_type: "code",

  automaticSilentRenew: true,

  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};

export function onSigninCallback() {
  window.history.replaceState({}, document.title, window.location.pathname);
}