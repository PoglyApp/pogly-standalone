import { useEffect, useRef, useState } from "react";
import { Identity, ConnectionId, SubscriptionEventContextInterface } from "spacetimedb";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";
import { Config, DbConnection, ErrorContext, RemoteReducers, RemoteTables, SetReducerFlags } from "../module_bindings";
import { DebugLogger } from "../Utility/DebugLogger";
import { StopHeartbeat } from "../Utility/PingHeartbeat";
import { SetStdbConnected } from "../Utility/SetStdbConnected";

const useStDB = (
  connectionConfig: ConnectionConfigType | undefined,
  setStdbConnected: Function,
  setInstanceConfigured?: Function,
  setStdbAuthenticated?: Function
) => {
  const [identity, setIdentity] = useState<Identity>();
  const [config, setConfig] = useState<Config>();
  const [error, setError] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState<boolean>(false);
  const [client, setClient] = useState<DbConnection>();

  useEffect(() => {
    if (!connectionConfig) return;
    DebugLogger("Initializing SpacetimeDB");

    const stdbToken = localStorage.getItem("twitchIdToken") || localStorage.getItem("stdbToken") || "";
    let stdbDomain = connectionConfig?.domain || "";

    const isOverlay: Boolean = window.location.href.includes("/overlay");

    if (isOverlay && stdbDomain === "") {
      stdbDomain = "wss://maincloud.spacetimedb.com";
    }

    const moduleName = "pogly-" + connectionConfig?.module.replace("_", "-").toLocaleLowerCase();

    const onConnect = (DbCtx: DbConnection, identity: Identity, token: string) => {
      try {
        setIdentity(identity);
        setClient(DbCtx);
        if (!isOverlay) localStorage.setItem("stdbToken", token);
        console.log("Connected to StDB! [" + identity.toHexString() + "] @ [" + DbCtx.connectionId.toHexString() + "]");

        client
          .subscriptionBuilder()
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
      console.log("Disconnected!", ErrCtx.event?.message, error);
    };

    const onConnectError = (ErrCtx: ErrorContext, error: Error | null) => {
      setError(true);
      StopHeartbeat();
      console.log("Error with SpacetimeDB: ", ErrCtx.event?.message, error);
    };

    const client = DbConnection.builder()
      .withUri(stdbDomain)
      .withModuleName(moduleName)
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
  }, [connectionConfig, setInstanceConfigured, setStdbConnected, setStdbAuthenticated, error]);

  return {
    Client: client,
    Identity: identity,
    InstanceConfig: config,
    Error: error,
    Disconnected: disconnected,
    Runtime: connectionConfig,
  };
};

export default useStDB;
