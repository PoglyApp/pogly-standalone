import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Editor } from "./editor/Editor";
import { Canvas } from "./pages/Canvas";
import { Overlay } from "./pages/Overlay";
import { NotFound } from "./pages/404";
import useSpacetimeDB from "./spacetimedb/useSpacetimeDB";
import { UserContext } from "./contexts/UserContext.ts";
import { useState } from "react";
import { useConnectEvents } from "./spacetimedb/hooks/useConnectEvents.tsx";
import { UserType } from "./types/UserType.ts";
import { useGetConnectionConfig } from "./hooks/useGetConnectionConfig.tsx";
import { ConnectionConfigType } from "./types/config_types/ConnectionConfigType.ts";
import { ChooseInstanceContainer } from "./components/connection/ChooseInstanceContainer.tsx";

export const App: React.FC = () => {
  const [stdbInit, setStdbInit] = useState<boolean>(false);
  const [authentication, setAuthentication] = useState<boolean>(false);
  const [subscriptionsInit, setSubscriptionsInit] = useState<boolean>(false);

  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);

  const stdb = useSpacetimeDB(stdbInit, setStdbInit);
  useGetConnectionConfig(setConnectionConfig);

  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const authKey = "password"; // todo
  const nickname = "testing123"; //todo

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Editor />}>
        <Route index element={<Canvas />} />
        <Route path="overlay" element={<Overlay />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    ),
    {
      future: {
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_relativeSplatPath: true,
        v7_skipActionErrorRevalidation: true,
      },
    }
  );

  // 1) Check connection settings config & if null then <ChooseInstanceModal>
  if (!connectionConfig) {
    return <ChooseInstanceContainer />;
  }

  // 2) Check if spacetime is initialized properly, if yes, register events - check identity, address, error
  if (!stdb.Identity || !stdb.Address || stdb.Error || !stdb.Client || !stdb.Token)
    return <>SpacetimeDB is initializing...</>;
  useConnectEvents(stdb.Client, authKey, setAuthentication);

  // 3) Check if spacetime is connected to the instance - check config table for instance settings
  const configSettings = stdb.Client.db.config.version.find(0);
  if (!stdb.Client.isActive || !stdbInit || !configSettings) return <>Loading configuration...</>;

  // 4) "Connect" to the guest list
  stdb.Client.reducers.connect();

  // 5) Check if user is authenticated (authentication happens in useConnectEvents)
  if (!isOverlay && configSettings.authentication && !authentication) return <>Not authenticated! Reload...</>; // todo error/reload modal

  // 6) Redo final subscriptions - subscribe to all tables
  if (!subscriptionsInit) {
    stdb.Client.subscriptionBuilder()
      .onApplied(() => {
        setSubscriptionsInit(true);
      })
      .subscribe([
        "SELECT * FROM Heartbeat",
        "SELECT * FROM Guests",
        "SELECT * FROM Elements",
        "SELECT * FROM ElementData",
        "SELECT * FROM Config",
        "SELECT * FROM Permissions",
        "SELECT * FROM Layouts",
      ]);
    return <>Loading data...</>;
  }

  // 7) Check if nickname is set, otherwise, set
  if (stdb.Client.db.guests.address.find(stdb.Address)?.nickname === "")
    stdb.Client.reducers.updateGuestNickname(nickname);
  //todo nickname modal

  // 8) Check if instance is setup, otherwise start first-time-setup modal
  // todo InitialSetupModal

  // 9) Create finalized UserType wrap & Load Router
  const user: UserType = {
    Address: stdb.Address,
    Identity: stdb.Identity,
    Token: stdb.Token,
    Nickname: nickname,
    Client: stdb.Client,
  };

  return (
    <UserContext.Provider value={user}>
      <RouterProvider future={{ v7_startTransition: true }} router={router} />
    </UserContext.Provider>
  );
};
