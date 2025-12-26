import type { UserManagerSettings } from "oidc-client-ts";

const issuer = (process.env.OIDC_ISSUER ?? "").trim();
const clientId = (process.env.OIDC_CLIENT_ID ?? "").trim();

export const oidcEnabled = issuer.length > 0 && clientId.length > 0;

export const oidcConfig: UserManagerSettings = {
  authority: issuer,
  client_id: clientId,
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  scope: "openid profile email",
  response_type: "code",
  automaticSilentRenew: true,
};

export function onSigninCallback() {
  window.history.replaceState({}, document.title, window.location.pathname);
}