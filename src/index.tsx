import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import { App } from "./App";
import "./index.css";
import "unfonts.css";

import { AuthProvider, useAuth } from "react-oidc-context";

const oidcConfig = {
  authority: "https://spacetimeauth.staging.spacetimedb.com/oidc",
  client_id: "client_0319cWpFKkEcwmVeoN44hS",
  redirect_uri: `${window.location.origin}/callback`,
  scope: "openid",
  response_type: "code",
  automaticSilentRenew: false,
  loadUserInfo: true,
  metadata: {
    issuer: "https://spacetimeauth.staging.spacetimedb.com/oidc",
    authorization_endpoint: "https://spacetimeauth.staging.spacetimedb.com/oidc/auth",
    token_endpoint: "https://spacetimeauth.staging.spacetimedb.com/oidc/token",
    jwks_uri: "https://spacetimeauth.staging.spacetimedb.com/oidc/jwks",
    end_session_endpoint: "https://spacetimeauth.staging.spacetimedb.com/oidc/session/end",
    pushed_authorization_request_endpoing: "https://spacetimeauth.staging.spacetimedb.com/oidc/request",
    userinfo_endpoint: "https://spacetimeauth.staging.spacetimedb.com/oidc/me",
  },
};

function onSigninCallback() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

export function OidcDebug() {
  const auth = useAuth();

  useEffect(() => {
    const ev = auth.events;

    const onUserLoaded = (u: any) => console.log("[OIDC] userLoaded", u?.profile?.sub, u);
    const onUserUnloaded = () => console.log("[OIDC] userUnloaded");
    const onAccessTokenExpiring = () => console.log("[OIDC] accessTokenExpiring");
    const onAccessTokenExpired = () => console.log("[OIDC] accessTokenExpired");
    const onSilentRenewError = (e: any) => console.warn("[OIDC] silentRenewError", e);
    const onUserSignedOut = () => console.log("[OIDC] userSignedOut");

    ev.addUserLoaded(onUserLoaded);
    ev.addUserUnloaded(onUserUnloaded);
    ev.addAccessTokenExpiring(onAccessTokenExpiring);
    ev.addAccessTokenExpired(onAccessTokenExpired);
    ev.addSilentRenewError(onSilentRenewError);
    ev.addUserSignedOut(onUserSignedOut);

    return () => {
      ev.removeUserLoaded(onUserLoaded);
      ev.removeUserUnloaded(onUserUnloaded);
      ev.removeAccessTokenExpiring(onAccessTokenExpiring);
      ev.removeAccessTokenExpired(onAccessTokenExpired);
      ev.removeSilentRenewError(onSilentRenewError);
      ev.removeUserSignedOut(onUserSignedOut);
    };
  }, [auth.events]);

  useEffect(() => {
    console.log("[OIDC] state", {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      error: auth.error?.message,
      activeNavigator: auth.activeNavigator,
      user: !!auth.user,
    });
  }, [auth.isLoading, auth.isAuthenticated, auth.error, auth.activeNavigator, auth.user]);

  return null;
}

// Enable/disable oidc debugging
const oidcDebugLogs = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
    {oidcDebugLogs ? <OidcDebug /> : <></>}
    <App />
  </AuthProvider>
);
