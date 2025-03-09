import { useEffect, useRef, useState } from "react";
import { Identity, ConnectionId} from "@clockworklabs/spacetimedb-sdk";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";
import { Config, DbConnection, ErrorContext } from "../module_bindings";
import { DebugLogger } from "../Utility/DebugLogger";
import { StopHeartbeat } from "../Utility/PingHeartbeat";
import { SetStdbConnected } from "../Utility/SetStdbConnected";

const useStDB = (
  connectionConfig: ConnectionConfigType | undefined,
  setStdbConnected: Function,
  setStdbAuthenticated: Function,
  setInstanceConfigured: Function
) => {
  const [identity, setIdentity] = useState<Identity>();
  const [config, setConfig] = useState<Config>();
  const [error, setError] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState<boolean>(false);
  const clientRef = useRef<DbConnection>();

  useEffect(() => {
    if (!connectionConfig) return;
    DebugLogger("Initializing SpacetimeDB");

    const stdbToken = localStorage.getItem("stdbToken") || "";
    let stdbDomain = connectionConfig?.domain || "";

    const isOverlay: Boolean = window.location.href.includes("/overlay");

    if (isOverlay && stdbDomain === "") {
      stdbDomain = "wss://pogly.spacetimedb.com";
    }

    const onConnect = (DbCtx: DbConnection, identity: Identity, token: string) => {
      try {
        setIdentity(identity);
        clientRef.current = DbCtx;
        if(!isOverlay) localStorage.setItem("stdbToken", token);
        console.log("Connected to StDB! [" + identity.toHexString() + "] @ [" + DbCtx.connectionId.toHexString() + "]");

        client.subscriptionBuilder()
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
    }
    
    const onDisconnect = (ErrCtx: ErrorContext, error: Error | undefined) => {
      setDisconnected(true);
      StopHeartbeat();
      console.log("Disconnected!", ErrCtx.event?.message, error);
    }

    const onConnectError = (ErrCtx: ErrorContext, error: Error | null) => {
      setError(true);
      StopHeartbeat();
      console.log("Error with SpacetimeDB: ", ErrCtx.event?.message, error);
    }

    const client = DbConnection.builder()
      .withUri(stdbDomain)
      .withModuleName(connectionConfig?.module || "")
      .withToken(isOverlay ? "" : stdbToken)
      .onConnect(onConnect)
      .onConnectError(onConnectError)
      .onDisconnect(onDisconnect)
      .build();
      
    const onSubscriptionsApplied = () => {
      
      try {
        if(!clientRef.current) return;

        const fetchedConfig = clientRef.current.db.config.version.find(0);
        
        if(!fetchedConfig) {
          setError(true);
          return;
        }
  
        if(fetchedConfig.configInit) setInstanceConfigured(true);
  
        setConfig(fetchedConfig);
  
        if(!clientRef.current.connectionId) {
          setError(true);
          return;
        }
  
        SetStdbConnected(clientRef.current, fetchedConfig, setStdbConnected, setStdbAuthenticated);
      } catch {
        console.log("initialStateSync failed:", error);
      }
    }

  }, [connectionConfig, setInstanceConfigured, setStdbConnected, setStdbAuthenticated, error]);

  return {
    Client: clientRef.current,
    Identity: identity,
    InstanceConfig: config,
    Error: error,
    Disconnected: disconnected,
    Runtime: connectionConfig,
  };
};

export default useStDB;
