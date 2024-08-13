import "react-toastify/dist/ReactToastify.css";

import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from "react-router-dom";
import React, { ReactNode, useContext, useEffect, useState } from "react";

import { Home } from "./Pages/Home";
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
import { Identity } from "@clockworklabs/spacetimedb-sdk";
import Layouts from "./module_bindings/layouts";
import { LayoutContext } from "./Contexts/LayoutContext";

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
  const [stdbInitialized, setStdbInitialized] = useState<boolean>(false);

  // CONFIGS
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);
  const [instanceConfigured, setInstanceConfigured] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(JSON.parse(localStorage.getItem("settings")!) || {});

  // GENERAL
  const [nickname, setNickname] = useState<string | null>(null);
  const [modals, setModals] = useState<ReactNode[]>([]);
  const [activeLayout, setActiveLayout] = useState<Layouts | undefined>(undefined);

  const [spacetimeContext, setSpacetimeContext] = useState<SpacetimeContextType>();

  useGetVersionNumber(setVersionNumber);
  useGetConnectionConfig(setConnectionConfig);

  const spacetime = useStDB(connectionConfig, setStdbConnected, setStdbInitialized, setInstanceConfigured);

  useEffect(() => {
    if (!stdbInitialized) return;

    const nickname: string = localStorage.getItem("nickname") || "";

    if (nickname) {
      UpdateGuestNicknameReducer.call(nickname);

      setNickname(nickname);
    }

    // Local cache has not updated with the nickname at this point yet, hence the guestWithNickname
    const guest = Guests.findByIdentity(spacetime.Identity!);
    const guestWithNickname: Guests = { ...guest, nickname: nickname } as Guests;

    setSpacetimeContext({
      Client: spacetime.Client!,
      Identity: guestWithNickname,
      Elements: [],
      ElementData: [],
      Guests: [],
    });
  }, [stdbInitialized, spacetime.Identity, spacetime.Client]);

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

  // Step 2) Are we connected to SpacetimeDB?
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
    return <Loading text="Loading Configuration" />;
  }

  // Step 3) If Authentication is required, are we Authenticated?
  if (spacetime.InstanceConfig!.authentication) {
    const guest = Guests.findByIdentity(spacetime.Identity!);

    if (!guest || !guest.authenticated) {
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
  }

  // Step 4) Redo final subscriptions ONLY ONCE
  if (!stdbInitialized) {
    SetSubscriptions(spacetime.Client!);
  }

  // Step 5) Is SpacetimeDB fully initialized?
  if (!stdbInitialized) {
    return <Loading text="Loading Data" />;
  }

  // Step 6) Has nickname been set?
  if (!nickname) {
    return <SetNicknameModal identity={spacetime.Identity} setNickname={setNickname} />;
  }

  // Step 7) Has the Pogly Instance been configured?
  if (!instanceConfigured) {
    return (
      <InitialSetupModal
        config={spacetime.InstanceConfig!}
        connectionConfig={connectionConfig}
        setInstanceConfigured={setInstanceConfigured}
        versionNumber={versionNumber}
      />
    );
  }

  // Step 8) Load Pogly
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
