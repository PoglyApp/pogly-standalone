import ReactDOM from "react-dom/client";
import { useEffect } from "react";
import { App } from "./App";
import "./index.css";
import "unfonts.css";

import { Provider } from "react-redux";
import { store } from "./Store/Features/store";
import { useAuth } from "react-oidc-context";
import { DynamicAuthProvider } from "./DynamicAuthProvider";

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
  <DynamicAuthProvider onSigninCallback={onSigninCallback} oidcDebugLogs={oidcDebugLogs}>
    {oidcDebugLogs ? (<OidcDebug />) : (<></>)}
    <Provider store={store}>
      <App />
    </Provider>
  </DynamicAuthProvider>
);
