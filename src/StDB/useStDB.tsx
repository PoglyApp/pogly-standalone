import { useContext, useEffect, useState } from "react";
import { ConnectionId, Identity, SubscriptionEventContextInterface } from "spacetimedb";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";
import { Config, DbConnection, ErrorContext, RemoteReducers, RemoteTables, SetReducerFlags } from "../module_bindings";
import { DebugLogger } from "../Utility/DebugLogger";
import { StopHeartbeat } from "../Utility/PingHeartbeat";
import { SetStdbConnected } from "../Utility/SetStdbConnected";
import { useAuth } from "react-oidc-context";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";

const useStDB = (
  connectionConfig: ConnectionConfigType | undefined,
  setStdbConnected: Function,
  setInstanceConfigured?: Function,
  setStdbAuthenticated?: Function
) => {
  const auth = useAuth();
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

    let stdbDomain = connectionConfig?.domain || "";
    const isOverlay: Boolean = window.location.href.includes("/overlay");
    if (isOverlay && stdbDomain === "") {
      stdbDomain = "wss://maincloud.spacetimedb.com";
    }

    let stdbToken = "";
    if (!isOverlay) {
      if (auth.isLoading || !auth.isAuthenticated || !auth.user?.id_token) return;
      stdbToken = auth.user.id_token;
    }

    let modulename = connectionConfig?.module.replace("_", "-").toLocaleLowerCase() || "";

    if (window.location.origin) {
      modulename = "pogly-" + modulename;
    }

    DebugLogger("Initializing SpacetimeDB");

    setInitialized(true);

    const onConnect = (DbCtx: DbConnection, identity: Identity, token: string) => {
      try {
        setIdentity(identity);
        setClient(DbCtx);
        console.log("Connected to StDB! [" + identity.toHexString() + "] @ [" + DbCtx.connectionId.toHexString() + "]");

        DbCtx.subscriptionBuilder()
          .onApplied(onSubscriptionsApplied)
          .subscribe([
            "SELECT * FROM Heartbeat",
            "SELECT * FROM Guests",
            "SELECT * FROM Config",
            "SELECT * FROM Permissions",
          ]);
      } catch (error) {
        console.log("SpacetimeDB connection failed!", error);
      }
    };

    const onDisconnect = (ErrCtx: ErrorContext, error: Error | undefined) => {
      setDisconnected(true);
      StopHeartbeat();
      setSpacetimeDB((old: any) => ({ ...old, Disconnected: true }));
      console.log("Disconnected!", ErrCtx.event?.message, error);
    };

    const onConnectError = (ErrCtx: ErrorContext, error: Error | null) => {
      setError(true);
      StopHeartbeat();
      console.log("Error with SpacetimeDB: ", ErrCtx.event?.message, error);
      if (error && error.message.includes("Unauthorized")) {
        setTokenExpired(true);
      }
    };

    const client = DbConnection.builder()
      .withUri(stdbDomain)
      .withModuleName(modulename)
      .withToken(isOverlay ? "" : stdbToken)
      .onConnect(onConnect)
      .onConnectError(onConnectError)
      .onDisconnect(onDisconnect)
      .build();

    client.db.heartbeat.id.find(0);

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

        SetStdbConnected(client, fetchedConfig, setStdbConnected, setStdbAuthenticated);
      } catch {
        console.log("initialStateSync failed:", error);
      }
    };
  }, [
    connectionConfig,
    setInstanceConfigured,
    setStdbConnected,
    setStdbAuthenticated,
    error,
    auth.isLoading,
    auth.isAuthenticated,
    auth.user?.id_token,
  ]);

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
