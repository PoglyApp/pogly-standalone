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

export const App: React.FC = () => {
  const { closeModal } = useContext(ModalContext);

  const [versionNumber, setVersionNumber] = useState<string>("");
  const [activePage, setActivePage] = useState<Number>(0);

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

  // CONFIGS
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);
  const [instanceConfigured, setInstanceConfigured] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(JSON.parse(localStorage.getItem("settings")!) || {
    "debug":false,
    "cursorName":true,
    "compressUpload":true,
    "compressPaste":true
  });

  // GENERAL
  const [nickname, setNickname] = useState<string | null>(null);
  const [modals, setModals] = useState<ReactNode[]>([]);
  const [activeLayout, setActiveLayout] = useState<Layouts | undefined>(undefined);

  const [spacetimeContext, setSpacetimeContext] = useState<SpacetimeContextType>();

  useGetVersionNumber(setVersionNumber);
  useGetConnectionConfig(setConnectionConfig);

  const spacetime = useStDB(connectionConfig, setStdbConnected, setStdbAuthenticated, setStdbInitialized, setInstanceConfigured);

  useEffect(() => {
    if (!stdbInitialized) return;
    if (!spacetime.Identity) return;
    if (!spacetime.Client) return;

    const nickname: string = localStorage.getItem("nickname") || "";

    if (nickname) {
      UpdateGuestNicknameReducer.call(nickname);

      setNickname(nickname);
    }

    // Local cache has not updated with the nickname at this point yet, hence the guestWithNickname
    const guest = Guests.findByIdentity(spacetime.Identity);
    const guestWithNickname: Guests = { ...guest, nickname: nickname } as Guests;

    setSpacetimeContext({
      Client: spacetime.Client,
      Identity: guestWithNickname,
      Elements: [],
      ElementData: [],
      Guests: [],
    });
  }, [stdbInitialized, spacetime.Identity, spacetime.Client]);

  useEffect(() => {
    stdbAuthenticatedRef.current = stdbAuthenticated;
  },[stdbAuthenticated])

  useEffect(() => {
    if (!stdbInitialized) return;
    if (!activeLayout) setActiveLayout(Layouts.filterByActive(true).next().value);
  }, [activeLayout, stdbInitialized]);

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
            />
          }
        />
        <Route path="overlay" element={<Overlay />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  // Step 1) Are connection settings configured?
  if (!connectionConfig) return <ChooseInstanceModal setInstanceSettings={setConnectionConfig} />;

  // Step 2) Check that spacetime properties got initialized properly, avoid null exceptions
  if (!spacetime.Client) {
    if (spacetime.Error) {
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
    if (spacetime.Error) {
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
  if (!spacetime.InstanceConfig) {
    if (spacetime.Error) {
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
    if (spacetime.Error) {
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

    const alreadyLogged = Guests.findByIdentity(spacetime.Identity);

    if(alreadyLogged) {
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Clear Connections & Reload"
          titleText="Multiple Connections Detected"
          contentText="Pogly only supports a single connection from each identity at this time.
                Either multiple tabs are open, or an error occurred and your identity is still signed in."
          clearSettings={false}
          kickSelf={true}
        />
      );
    }

    ConnectReducer.call();

    return <Loading text="Connecting to Instance" />;
  }

  // Step 4) If Authentication is required, are we Authenticated?
  if (spacetime.InstanceConfig.authentication) {
    if(stdbAuthTimeout) {
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

    if(!stdbAuthenticated) {
      if (spacetime.InstanceConfig.authentication) AuthenticateReducer.call(connectionConfig.authKey);
      if(timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {setStdbAuthTimeout(!stdbAuthenticatedRef.current)}, 2500);

      return <Loading text="Authenticating..." />;
    }

    if(timeout) clearTimeout(timeout);
  }

  // Step 5) Redo final subscriptions ONLY ONCE
  if (!stdbInitialized) {
    SetSubscriptions(spacetime.Client);
  }

  // Step 6) Is SpacetimeDB fully initialized?
  if (!stdbInitialized) {
    return <Loading text="Loading Data" />;
  }

  if (!spacetimeContext) {
    return <Loading text="Loading Canvas" />;
  }

  // Step 7) Has nickname been set?
  if (!nickname) {
    return <SetNicknameModal identity={spacetime.Identity} setNickname={setNickname} />;
  }

  // Step 8) Has the Pogly Instance been configured?
  if (!instanceConfigured) {
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
