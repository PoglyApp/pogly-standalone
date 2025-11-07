import { useContext, useEffect, useRef, useState } from "react";
import useStDB from "../../StDB/useStDB";
import { Guests } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { SetSubscriptions } from "../../Utility/SetSubscriptions";
import { useLocation, useNavigate } from "react-router-dom";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { ConnectionContainer } from "./Components/ConnectionContainer";
import { ModuleOnboarding } from "./Components/ModuleOnboarding";

export const Login = () => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const navigate = useNavigate();

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
  const [legacyLogin, setLegacyLogin] = useState<boolean>(false);

  const spacetime = useStDB(connectionConfig, setStdbConnected, setInstanceConfigured, setStdbAuthenticated);

  const location = useLocation();
  const from = location.state?.from?.pathname;

  useEffect(() => {
    if (spacetimeDB && from) {
      navigate(from, { replace: true });
    }
  }, [spacetimeDB]);

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
      Config: spacetime.InstanceConfig,
      Subscriptions: stdbSubscriptions,
    });
  }, [stdbSubscriptions, stdbInitialized, spacetime.Identity, spacetime.Client, spacetime.Runtime]);

  useEffect(() => {
    stdbAuthenticatedRef.current = stdbAuthenticated;
  }, [stdbAuthenticated]);

  // Step 1) Are connection settings configured?
  if (!connectionConfig) {
    return (
      <ConnectionContainer
        setInstanceSettings={setConnectionConfig}
        setNickname={setNickname}
        setLegacyLogin={setLegacyLogin}
      />
    );
  }

  // Step 2) Check that spacetime properties got initialized properly, avoid null exceptions
  if (!spacetime.Client) {
    if (spacetime.Error) {
      /*return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving starting SpacetimeDB Client!"
          contentText="The standalone client encountered an issue starting the SpacetimeDB Client. 
                  Please check console logs and send to a developer!"
          clearSettings={true}
        />
      );*/
      return <>SpacetimeDB Client error</>;
    }
    //return <Loading text="Loading SpacetimeDB" />;
    return <>Loading SpacetimeDB</>;
  }

  if (!spacetime.Identity) {
    if (spacetime.Error) {
      /*return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving SpacetimeDB Identity!"
          contentText="Please try again. If this error persists, you may have to clear your LocalStorage AuthToken."
          clearSettings={true}
        />
      );*/
      return <>SpacetimeDB Identity error</>;
    }
    //return <Loading text="Retreiving Identity" />;
    return <>Retreiving identity</>;
  }

  if (!spacetime.Client.connectionId) {
    if (spacetime.Error) {
      /*return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving SpacetimeDB Address!"
          contentText="Please try again. If this error persists, you may have to clear your LocalStorage AuthToken."
          clearSettings={true}
        />
      );*/
      return <>SpacetimeDB Address error</>;
    }
    //return <Loading text="Retreiving Address" />;
    return <>Retreiving address</>;
  }

  if (!spacetime.InstanceConfig) {
    if (spacetime.Error) {
      /*return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error loading Pogly configuration!"
          contentText="This happens when the standalone client is unable to access the database, or if your are having connection issues."
          clearSettings={true}
        />
      );*/
      return <>Configuration error</>;
    }
    //return <Loading text="Loading Configuration" />;
    return <>Loading configuration</>;
  }

  // Step 3) Are we connected to SpacetimeDB?
  if (!stdbConnected) {
    if (spacetime.Error) {
      /*return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error connecting to Pogly instance!"
          contentText="This means that either the domain or module name selected are invalid. Please try again!"
          clearSettings={true}
        />
      );*/
      return <>Pogly Instance error</>;
    }

    const alreadyLogged = spacetime.Client.db.guests.address.find(spacetime.Client.connectionId);

    if (!isOverlay && alreadyLogged) {
      /*return (
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
      );*/
      return <>Multi connection error</>;
    }

    spacetime.Client.reducers.connect();

    //return <Loading text="Connecting to Instance" />;
    return <>Connecting to Instance</>;
  }

  // Step 4) If Authentication is required, are we Authenticated?
  if (!isOverlay && spacetime.InstanceConfig.authentication) {
    if (stdbAuthTimeout) {
      /*return (
        <ErrorRefreshModal
          type="timer"
          refreshTimer={5}
          titleText="Authentication Required"
          contentText="This Pogly Standalone instance requires authentication.
                  You either did not provide an authentication key, or it was incorrect."
          clearSettings={true}
        />
      );*/
      return <>Authentication error</>;
    }

    let timeout = null;

    if (!stdbAuthenticated) {
      if (spacetime.InstanceConfig.authentication) spacetime.Client.reducers.authenticate(connectionConfig.authKey);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setStdbAuthTimeout(!stdbAuthenticatedRef.current);
      }, 2500);

      //return <Loading text="Authenticating..." />;
      return <>Authenticating...</>;
    }

    if (timeout) clearTimeout(timeout);
  }

  // Step 5) Redo final subscriptions ONLY ONCE && Start client heartbeat
  if (!stdbInitialized) {
    SetSubscriptions(spacetime.Client, setStdbSubscriptions, setStdbInitialized);
  }

  // Step 6) Is SpacetimeDB fully initialized?
  if (!stdbSubscriptions) {
    //return <Loading text="Loading data..." />;
    return <>Loading data</>;
  }

  if (!spacetimeDB) {
    //return <Loading text="Loading Canvas" />;
    return <>Loading canvas</>;
  }

  // Step 8) Has the Pogly Instance been configured?
  if (!instanceConfigured) {
    return <ModuleOnboarding legacyLogin={legacyLogin} connectionConfig={connectionConfig} spacetime={spacetime} />;
  }

  navigate("/canvas", { replace: true });

  return <></>;
};
