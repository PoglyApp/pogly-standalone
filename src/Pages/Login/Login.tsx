import "./Login.css";
import { useContext, useEffect, useRef, useState } from "react";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { ChooseInstanceModal } from "../../Components/Modals/ChooseInstanceModal";
import useStDB from "../../StDB/useStDB";
import { jwtDecode } from "jwt-decode";
import { Guests } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ErrorRefreshModal } from "../../Components/Modals/ErrorRefreshModal";
import { Loading } from "../../Components/General/Loading";
import { InitialSetupModal } from "../../Components/Modals/InitialSetupModal";
import { SetNicknameModal } from "../../Components/Modals/SetNicknameModal";
import { SetSubscriptions } from "../../Utility/SetSubscriptions";
import { StartHeartbeat } from "../../Utility/PingHeartbeat";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const { connectionConfig, setConnectionConfig } = useContext(ConfigContext);
  const { spacetimeDB, setSpacetimeDB } = useContext(SpacetimeContext);

  // STDB
  const [stdbConnected, setStdbConnected] = useState<boolean>(false);
  const [stdbAuthenticated, setStdbAuthenticated] = useState<boolean>(false);
  const [stdbAuthTimeout, setStdbAuthTimeout] = useState<boolean>(false);
  const [stdbInitialized, setStdbInitialized] = useState<boolean>(false);
  const [stdbSubscriptions, setStdbSubscriptions] = useState<boolean>(false);

  const stdbAuthenticatedRef = useRef<boolean>(false);

  const [instanceConfigured, setInstanceConfigured] = useState<boolean>(false);

  const [nickname, setNickname] = useState<string | null>(null);

  const spacetime = useStDB(connectionConfig, setStdbConnected, setStdbAuthenticated, setInstanceConfigured);

  useEffect(() => {
    if (
      !connectionConfig ||
      !stdbInitialized ||
      !stdbSubscriptions ||
      !spacetime.Identity ||
      !spacetime.Client ||
      !spacetime.Runtime
    )
      return;

    DebugLogger("Setting nickname and Spacetime context");

    let nickname: string = localStorage.getItem("nickname") || "";

    if (connectionConfig.token !== null) nickname = (jwtDecode(connectionConfig.token) as any).preferred_username;

    if (nickname) {
      spacetime.Client.reducers.updateGuestNickname(nickname);

      setNickname(nickname);
    }

    // Local cache has not updated with the nickname at this point yet, hence the guestWithNickname
    const guest = spacetime.Client.db.guests.address.find(spacetime.Client.connectionId);
    const guestWithNickname: Guests = { ...guest, nickname: nickname } as Guests;

    setSpacetimeDB({
      Client: spacetime.Client,
      Identity: guestWithNickname,
      Runtime: spacetime.Runtime,
      Elements: [],
      ElementData: [],
      Guests: [],
    });
  }, [stdbSubscriptions, stdbInitialized, spacetime.Identity, spacetime.Client, spacetime.Runtime]);

  useEffect(() => {
    DebugLogger("Setting SpacetimeDB authenticated ref");
    stdbAuthenticatedRef.current = stdbAuthenticated;
  }, [stdbAuthenticated]);

  // Step 1) Are connection settings configured?
  if (!connectionConfig) {
    DebugLogger("Connection config not configured");
    return <ChooseInstanceModal setInstanceSettings={setConnectionConfig} />;
  }

  // Step 2) Check that spacetime properties got initialized properly, avoid null exceptions
  if (!spacetime.Client) {
    DebugLogger("Waiting for SpacetimeDB client");
    if (spacetime.Error) {
      DebugLogger("Failed to load SpacetimeDB client");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving starting SpacetimeDB Client!"
          contentText="The standalone client encountered an issue starting the SpacetimeDB Client. 
                  Please check console logs and send to a developer!"
          clearSettings={true}
        />
      );
    }
    return <Loading text="Loading SpacetimeDB" />;
  }

  if (!spacetime.Identity) {
    DebugLogger("Waiting for SpacetimeDB identity");
    if (spacetime.Error) {
      DebugLogger("Failed to load SpacetimeDB identity");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving SpacetimeDB Identity!"
          contentText="Please try again. If this error persists, you may have to clear your LocalStorage AuthToken."
          clearSettings={true}
        />
      );
    }
    return <Loading text="Retreiving Identity" />;
  }

  if (!spacetime.Client.connectionId) {
    DebugLogger("Waiting for SpacetimeDB address");
    if (spacetime.Error) {
      DebugLogger("Failed to load SpacetimeDB address");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving SpacetimeDB Address!"
          contentText="Please try again. If this error persists, you may have to clear your LocalStorage AuthToken."
          clearSettings={true}
        />
      );
    }
    return <Loading text="Retreiving Address" />;
  }

  if (!spacetime.InstanceConfig) {
    DebugLogger("Waiting for instance config ");
    if (spacetime.Error) {
      DebugLogger("Failed to load instance config");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error loading Pogly configuration!"
          contentText="This happens when the standalone client is unable to access the database, or if your are having connection issues."
          clearSettings={true}
        />
      );
    }
    return <Loading text="Loading Configuration" />;
  }

  // Step 3) Are we connected to SpacetimeDB?
  if (!stdbConnected) {
    DebugLogger("Waiting for SpacetimeDB connection");
    if (spacetime.Error) {
      DebugLogger("Failed to connect to Pogly instance");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error connecting to Pogly instance!"
          contentText="This means that either the domain or module name selected are invalid. Please try again!"
          clearSettings={true}
        />
      );
    }

    const alreadyLogged = spacetime.Client.db.guests.address.find(spacetime.Client.connectionId);

    if (!isOverlay && alreadyLogged) {
      DebugLogger("Guest already logged in");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Clear Connections & Reload"
          titleText="Multiple Connections Detected"
          contentText="Pogly only supports a single connection from each identity at this time.
                  Either multiple tabs are open, or an error occurred and your identity is still signed in."
          clearSettings={true}
          kickSelf={true}
          client={spacetime.Client}
        />
      );
    }

    spacetime.Client.reducers.connect();

    return <Loading text="Connecting to Instance" />;
  }

  // Step 4) If Authentication is required, are we Authenticated?
  if (!isOverlay && spacetime.InstanceConfig.authentication) {
    DebugLogger("Is guest authenticated");
    if (stdbAuthTimeout) {
      DebugLogger("Authentication required but authentication failed");
      return (
        <ErrorRefreshModal
          type="timer"
          refreshTimer={5}
          titleText="Authentication Required"
          contentText="This Pogly Standalone instance requires authentication.
                  You either did not provide an authentication key, or it was incorrect."
          clearSettings={true}
        />
      );
    }

    let timeout = null;

    if (!stdbAuthenticated) {
      DebugLogger("Not authenticated");
      if (spacetime.InstanceConfig.authentication) spacetime.Client.reducers.authenticate(connectionConfig.authKey);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setStdbAuthTimeout(!stdbAuthenticatedRef.current);
      }, 2500);

      return <Loading text="Authenticating..." />;
    }

    if (timeout) clearTimeout(timeout);
  }

  // Step 5) Redo final subscriptions ONLY ONCE && Start client heartbeat
  if (!stdbInitialized) {
    DebugLogger("Starting Client->Server heartbeat!");
    StartHeartbeat(spacetime.Client);
    DebugLogger("Redoing subscriptions");
    SetSubscriptions(spacetime.Client, setStdbInitialized, setStdbSubscriptions);
  }

  // Step 6) Is SpacetimeDB fully initialized?
  if (!stdbSubscriptions) {
    DebugLogger("Waiting for subscriptions");
    return <Loading text="Loading data..." />;
  }

  if (!spacetimeDB) {
    DebugLogger("Waiting for SpacetimeDB context");
    return <Loading text="Loading Canvas" />;
  }

  // Step 7) Has nickname been set?
  if (!nickname) {
    DebugLogger("Nickname has not been set");
    return <SetNicknameModal client={spacetime.Client} identity={spacetime.Identity} setNickname={setNickname} />;
  }

  // Step 8) Has the Pogly Instance been configured?
  if (!instanceConfigured) {
    DebugLogger("Pogly Instance is not configured");
    return (
      <InitialSetupModal
        client={spacetime.Client}
        config={spacetime.InstanceConfig}
        connectionConfig={connectionConfig}
        setInstanceConfigured={setInstanceConfigured}
      />
    );
  }

  //navigate("/canvas");

  return <h1>Login</h1>;
};
