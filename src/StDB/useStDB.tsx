import { useContext, useEffect, useState } from "react";
import { Identity, SubscriptionEventContextInterface } from "spacetimedb";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";
import { Config, DbConnection, ErrorContext, RemoteReducers, RemoteTables, SetReducerFlags } from "../module_bindings";
import { DebugLogger } from "../Utility/DebugLogger";
import { StopHeartbeat } from "../Utility/PingHeartbeat";
import { SetStdbConnected } from "../Utility/SetStdbConnected";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";

const useStDB = (
  connectionConfig: ConnectionConfigType | undefined,
  setStdbConnected: Function,
  setInstanceConfigured?: Function,
  setStdbAuthenticated?: Function,
  oidcIdToken?: string
) => {
  const { setSpacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  const [identity, setIdentity] = useState<Identity>();
  const [config, setConfig] = useState<Config>();
  const [error, setError] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState<boolean>(false);
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);
  const [client, setClient] = useState<DbConnection>();

  useEffect(() => {
    if (!connectionConfig || initialized) return;

    const isOverlay = window.location.href.includes("/overlay");

    let stdbDomain = connectionConfig?.domain || "";
    if (isOverlay && stdbDomain === "") {
      stdbDomain = "wss://maincloud.spacetimedb.com";
    }

    const normalizedOidcToken = typeof oidcIdToken === "string" ? oidcIdToken.trim() : "";
    const usingOidc = normalizedOidcToken.length > 0;

    let stdbToken = "";
    if (!isOverlay && !usingOidc) {
      stdbToken = localStorage.getItem("stdb-token") || "";
    }

    let modulename = connectionConfig?.module.replace("_", "-").toLocaleLowerCase() || "";
    if (window.location.origin === "https://cloud.pogly.gg") {
      modulename = "pogly-" + modulename;
    }

    const tokenToUse = isOverlay ? "" : usingOidc ? normalizedOidcToken : stdbToken;

    DebugLogger("Initializing SpacetimeDB");
    setInitialized(true);

    let clientConn: DbConnection | null = null;

    const onSubscriptionsApplied = (
      ctx: SubscriptionEventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags>
    ) => {
      try {
        const fetchedConfig = ctx.db.config.version.find(0);

        if (!fetchedConfig) {
          setError(true);
          return;
        }

        if (fetchedConfig.configInit && setInstanceConfigured) setInstanceConfigured(true);

        setConfig(fetchedConfig);

        if (clientConn) {
          SetStdbConnected(clientConn, fetchedConfig, setStdbConnected, setStdbAuthenticated);
        }
      } catch (e) {
        console.log("initialStateSync failed:", e);
      }
    };

    const onConnect = (DbCtx: DbConnection, ident: Identity, token: string) => {
      try {
        setIdentity(ident);
        setClient(DbCtx);

        if (!isOverlay && !usingOidc) {
          localStorage.setItem("stdb-token", token);
        }

        console.log("Connected to StDB! [" + ident.toHexString() + "] @ [" + DbCtx.connectionId.toHexString() + "]");

        DbCtx.subscriptionBuilder()
          .onApplied(onSubscriptionsApplied)
          .subscribe([
            "SELECT * FROM Heartbeat",
            "SELECT * FROM Guests",
            "SELECT * FROM Config",
            "SELECT * FROM Permissions",
          ]);
      } catch (e) {
        console.log("SpacetimeDB connection failed!", e);
      }
    };

    const onDisconnect = (ErrCtx: ErrorContext, err: Error | undefined) => {
      setDisconnected(true);
      StopHeartbeat();
      setSpacetimeDB((old: any) => ({ ...old, Disconnected: true }));
      console.log("Disconnected!", ErrCtx.event?.message, err);
    };

    const onConnectError = (ErrCtx: ErrorContext, err: Error | null) => {
      setError(true);
      StopHeartbeat();
      console.log("Error with SpacetimeDB: ", ErrCtx.event?.message, err);
      if (err && err.message.includes("Unauthorized")) {
        setTokenExpired(true);
      }
    };

    const builder = DbConnection.builder()
      .withUri(stdbDomain)
      .withModuleName(modulename)
      .withToken(tokenToUse)
      .onConnect(onConnect)
      .onConnectError(onConnectError)
      .onDisconnect(onDisconnect);

    clientConn = builder.build();
    clientConn.db.heartbeat.id.find(0);
  }, [connectionConfig, initialized, oidcIdToken, setInstanceConfigured, setStdbConnected, setStdbAuthenticated, setSpacetimeDB]);

  return {
    Client: client,
    Identity: identity,
    InstanceConfig: config,
    Error: error,
    Disconnected: disconnected,
    TokenExpired: tokenExpired,
    Runtime: connectionConfig,
  };
};

export default useStDB;
