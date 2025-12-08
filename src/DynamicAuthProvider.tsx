import { ReactNode, useEffect, useState } from "react";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { DbConnection } from "./module_bindings";

interface DynamicAuthProviderProps {
  children: ReactNode;
  onSigninCallback?: () => void;
  oidcDebugLogs?: boolean;
}

export function DynamicAuthProvider({ children, onSigninCallback, oidcDebugLogs }: DynamicAuthProviderProps) {
  const [oidcConfig, setOidcConfig] = useState<AuthProviderProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isOverlay = window.location.href.includes("/overlay");

    // For overlay mode, skip OIDC entirely and use default config
    if (isOverlay) {
      console.log("[DynamicAuth] Overlay mode detected, using default config");
      setOidcConfig(getDefaultOidcConfig());
      setLoading(false);
      return;
    }

    // Connect to SpacetimeDB without auth to fetch OIDC config
    const fetchOidcConfig = async () => {
      try {
        // Get connection details from URL params or use defaults
        const params = new URLSearchParams(window.location.search);
        const defaultDomain = window.location.protocol === "https:"
          ? `wss://${window.location.host}`
          : `ws://${window.location.host}`;
        const domain = params.get("domain") || defaultDomain;
        const module = params.get("module") || "pogly";

        const client = DbConnection.builder()
          .withUri(domain)
          .withModuleName(module)
          .withToken("")
          .onConnect((dbCtx, identity) => {
            console.log("[DynamicAuth] Connected to fetch config");

            dbCtx.subscriptionBuilder()
              .onApplied((ctx) => {
                const config = ctx.db.config.version.find(0);

                if (!config || !config.configInit) {
                  console.log("[DynamicAuth] Config not initialized - checking for custom OIDC on current host");
                  // Try to use OIDC from current host (for self-hosted instances)
                  const customIssuer = `https://${window.location.host}/oidc`;

                  // For self-hosted, try custom OIDC; otherwise use SpacetimeDB default
                  if (window.location.host !== "localhost:3000" && window.location.host !== "127.0.0.1:3000") {
                    console.log("[DynamicAuth] Self-hosted instance detected, will use custom OIDC after init");
                    // Use default temporarily - user will need to refresh after SetConfig is called
                    setOidcConfig(getDefaultOidcConfig());
                  } else {
                    setOidcConfig(getDefaultOidcConfig());
                  }
                  setLoading(false);
                  client.disconnect();
                  return;
                }

                const { oidcIssuer, oidcAudience } = config;

                if (!oidcIssuer || !oidcAudience) {
                  console.log("[DynamicAuth] OIDC not configured, using default SpacetimeDB auth");
                  setOidcConfig(getDefaultOidcConfig());
                } else {
                  console.log("[DynamicAuth] Using custom OIDC:", oidcIssuer);
                  setOidcConfig(getCustomOidcConfig(oidcIssuer, oidcAudience));
                }

                setLoading(false);
                client.disconnect();
              })
              .subscribe(["SELECT * FROM Config"]);
          })
          .onConnectError((errCtx, error) => {
            console.error("[DynamicAuth] Connection error:", error);
            setOidcConfig(getDefaultOidcConfig());
            setLoading(false);
          })
          .build();
      } catch (error) {
        console.error("[DynamicAuth] Failed to fetch config:", error);
        setOidcConfig(getDefaultOidcConfig());
        setLoading(false);
      }
    };

    fetchOidcConfig();
  }, []);

  if (loading || !oidcConfig) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      {children}
    </AuthProvider>
  );
}

function getDefaultOidcConfig(): AuthProviderProps {
  return {
    authority: "https://auth.spacetimedb.com/oidc",
    client_id: "client_031BvnxblLKmMtctMbLllZ",
    redirect_uri: `${window.location.origin}/callback`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    scope: "openid profile",
    response_type: "code",
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    automaticSilentRenew: false,
    includeIdTokenInSilentRenew: true,
    silent_redirect_uri: `${window.location.origin}/silent-oidc-renew.html`,
    loadUserInfo: false,
    metadata: {
      issuer: "https://auth.spacetimedb.com/oidc",
      authorization_endpoint: "https://auth.spacetimedb.com/oidc/auth",
      token_endpoint: "https://auth.spacetimedb.com/oidc/token",
      jwks_uri: "https://auth.spacetimedb.com/oidc/jwks",
      end_session_endpoint: "https://auth.spacetimedb.com/oidc/session/end",
      userinfo_endpoint: "https://auth.spacetimedb.com/oidc/me",
      introspection_endpoint: "https://auth.spacetimedb.com/oidc/token/introspection"
    },
  };
}

function getCustomOidcConfig(issuer: string, clientId: string): AuthProviderProps {
  return {
    authority: issuer,
    client_id: clientId,
    redirect_uri: `${window.location.origin}/callback`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    scope: "openid profile",
    response_type: "code",
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    automaticSilentRenew: false,
    includeIdTokenInSilentRenew: true,
    silent_redirect_uri: `${window.location.origin}/silent-oidc-renew.html`,
    loadUserInfo: false,
  };
}

