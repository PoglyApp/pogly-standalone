import "react-toastify/dist/ReactToastify.css";

import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from "react-router-dom";
import React, { ReactNode, useContext, useEffect, useRef, useState } from "react";

import { Canvas } from "./Pages/Canvas";
import { Header } from "./Header/Header";

import { Overlay } from "./Pages/Overlay";
import { useGetConnectionConfig } from "./Hooks/useGetConnectionConfig";
import { ConnectionConfigType } from "./Types/ConfigTypes/ConnectionConfigType";
import useStDB from "./StDB/useStDB";
import { ChooseInstanceModal } from "./Components/Modals/ChooseInstanceModal";
import { InitialSetupModal } from "./Components/Modals/InitialSetupModal";
import { SetNicknameModal } from "./Components/Modals/SetNicknameModal";
import { ToastContainer } from "react-toastify";
import { useGetVersionNumber } from "./Hooks/useGetVersionNumber";
import { Loading } from "./Components/General/Loading";
import Guests from "./module_bindings/guests";
import { ErrorRefreshModal } from "./Components/Modals/ErrorRefreshModal";
import { SetSubscriptions } from "./Utility/SetSubscriptions";
import { SpacetimeContext } from "./Contexts/SpacetimeContext";
import { ConfigContext } from "./Contexts/ConfigContext";
import { SettingsContext } from "./Contexts/SettingsContext";
import { ModalContext } from "./Contexts/ModalContext";
import { CanvasInitializedType } from "./Types/General/CanvasInitializedType";
import UpdateGuestNicknameReducer from "./module_bindings/update_guest_nickname_reducer";
import { NotFound } from "./Pages/NotFound";
import { SpacetimeContextType } from "./Types/General/SpacetimeContextType";
import Layouts from "./module_bindings/layouts";
import { LayoutContext } from "./Contexts/LayoutContext";
import ConnectReducer from "./module_bindings/connect_reducer";
import AuthenticateReducer from "./module_bindings/authenticate_reducer";
import { DebugLogger } from "./Utility/DebugLogger";

export const App: React.FC = () => {
  const { closeModal } = useContext(ModalContext);

  const [versionNumber, setVersionNumber] = useState<string>("");
  const [activePage, setActivePage] = useState<Number>(0);
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const isWidget: Boolean = window.location.href.includes("/widget");

  // CANVAS
  const [canvasInitialized, setCanvasInitialized] = useState<CanvasInitializedType>({
    elementsFetchInitialized: false,
    elementEventsInitialized: false,
    elementDataEventsInitialized: false,
    guestFetchInitialized: false,
    guestEventsInitialized: false,
  });

  // STDB
  const [stdbConnected, setStdbConnected] = useState<boolean>(false);
  const stdbAuthenticatedRef = useRef<boolean>(false);
  const [stdbAuthenticated, setStdbAuthenticated] = useState<boolean>(false);
  const [stdbAuthTimeout, setStdbAuthTimeout] = useState<boolean>(false);
  const [stdbInitialized, setStdbInitialized] = useState<boolean>(false);
  const [stdbSubscriptions, setStdbSubscriptions] = useState<boolean>(false);

  // CONFIGS
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);
  const [instanceConfigured, setInstanceConfigured] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(
    JSON.parse(localStorage.getItem("settings")!) || {
      debug: false,
      cursorName: true,
      compressUpload: true,
      compressPaste: true,
    }
  );

  // GENERAL
  const [nickname, setNickname] = useState<string | null>(null);
  const [modals, setModals] = useState<ReactNode[]>([]);
  const [activeLayout, setActiveLayout] = useState<Layouts | undefined>(undefined);

  const [spacetimeContext, setSpacetimeContext] = useState<SpacetimeContextType>();

  useGetVersionNumber(setVersionNumber);
  useGetConnectionConfig(setConnectionConfig);

  const spacetime = useStDB(
    connectionConfig,
    setStdbConnected,
    setStdbAuthenticated,
    setStdbInitialized,
    setInstanceConfigured
  );

  useEffect(() => {
    if (isWidget) return;
    if (!stdbInitialized) return;
    if (!spacetime.Identity) return;
    if (!spacetime.Address) return;
    if (!spacetime.Client) return;
    if (!spacetime.Runtime) return;

    DebugLogger("Setting nickname and Spacetime context");

    const nickname: string = localStorage.getItem("nickname") || "";

    if (nickname) {
      UpdateGuestNicknameReducer.call(nickname);

      setNickname(nickname);
    }

    // Local cache has not updated with the nickname at this point yet, hence the guestWithNickname
    const guest = Guests.findByAddress(spacetime.Address);
    const guestWithNickname: Guests = { ...guest, nickname: nickname } as Guests;

    setSpacetimeContext({
      Client: spacetime.Client,
      Identity: guestWithNickname,
      Runtime: spacetime.Runtime,
      Elements: [],
      ElementData: [],
      Guests: [],
    });
  }, [stdbInitialized, spacetime.Identity, spacetime.Address, spacetime.Client, spacetime.Runtime, isWidget]);

  useEffect(() => {
    if (isWidget) return;
    DebugLogger("Setting SpacetimeDB authenticated ref");
    stdbAuthenticatedRef.current = stdbAuthenticated;
  }, [stdbAuthenticated, isWidget]);

  useEffect(() => {
    if (isWidget) return;
    if (!stdbInitialized) return;
    DebugLogger("Setting active layout");
    if (!activeLayout) setActiveLayout(Layouts.filterByActive(true).next().value);
  }, [activeLayout, stdbInitialized, isWidget]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<Header activePage={activePage} setActivePage={setActivePage} onlineVersion={versionNumber} />}
      >
        {/*TODO: Home page*/}
        {/*<Route index element={<Home />} />*/}
        <Route
          index
          element={
            <Canvas
              setActivePage={setActivePage}
              canvasInitialized={canvasInitialized}
              setCanvasInitialized={setCanvasInitialized}
              disconnected={spacetime.Disconnected}
            />
          }
        />
        <Route path="overlay" element={<Overlay disconnected={spacetime.Disconnected} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  if (isWidget) {
    return (<RouterProvider router={router} />);
  }

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

  if (!spacetime.Address) {
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

    const alreadyLogged = Guests.findByAddress(spacetime.Address);

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
        />
      );
    }

    ConnectReducer.call();

    return <Loading text="Connecting to Instance" />;
  }

  // Step 4) If Authentication is required, are we Authenticated?
  if (spacetime.InstanceConfig.authentication) {
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
      if (spacetime.InstanceConfig.authentication) AuthenticateReducer.call(connectionConfig.authKey);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setStdbAuthTimeout(!stdbAuthenticatedRef.current);
      }, 2500);

      return <Loading text="Authenticating..." />;
    }

    if (timeout) clearTimeout(timeout);
  }

  // Step 5) Redo final subscriptions ONLY ONCE
  if (!stdbInitialized) {
    if (stdbInitialized || stdbSubscriptions) return <Loading text="Loading data..." />;
    DebugLogger("Redoing subscriptions");
    SetSubscriptions(spacetime.Client, setStdbSubscriptions);
  }

  // Step 6) Is SpacetimeDB fully initialized?
  if (!stdbInitialized) {
    DebugLogger("Waiting for SpacetimeDB to fully initialize");
    return <Loading text="Loading Data" />;
  }

  if (!spacetimeContext) {
    DebugLogger("Waiting for SpacetimeDB context");
    return <Loading text="Loading Canvas" />;
  }

  // Step 7) Has nickname been set?
  if (!nickname) {
    DebugLogger("Nickname has not been set");
    return <SetNicknameModal identity={spacetime.Identity} setNickname={setNickname} />;
  }

  // Step 8) Has the Pogly Instance been configured?
  if (!instanceConfigured) {
    DebugLogger("Pogly Instance is not configured");
    return (
      <InitialSetupModal
        config={spacetime.InstanceConfig}
        connectionConfig={connectionConfig}
        setInstanceConfigured={setInstanceConfigured}
        versionNumber={versionNumber}
      />
    );
  }

  // Step 9) Load Pogly
  return (
    <SpacetimeContext.Provider value={spacetimeContext}>
      <ConfigContext.Provider value={spacetime.InstanceConfig}>
        <SettingsContext.Provider value={{ settings, setSettings }}>
          <LayoutContext.Provider value={{ activeLayout: activeLayout, setActiveLayout: setActiveLayout }}>
            <ModalContext.Provider value={{ modals, setModals, closeModal }}>
              {modals.map((modal) => {
                return modal;
              })}
              <RouterProvider router={router} />
              <ToastContainer />
            </ModalContext.Provider>
          </LayoutContext.Provider>
        </SettingsContext.Provider>
      </ConfigContext.Provider>
    </SpacetimeContext.Provider>
  );
};
