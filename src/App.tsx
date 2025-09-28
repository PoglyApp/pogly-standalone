import "react-toastify/dist/ReactToastify.css";

import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider, Navigate } from "react-router-dom";
import { useState } from "react";

import { useGetConnectionConfig } from "./Hooks/useGetConnectionConfig";
import { ConnectionConfigType } from "./Types/ConfigTypes/ConnectionConfigType";
import { ToastContainer } from "react-toastify";
import { SpacetimeContext } from "./Contexts/SpacetimeContext";
import { ConfigContext } from "./Contexts/ConfigContext";
import { SettingsContext } from "./Contexts/SettingsContext";
import { Error } from "./Pages/Error/Error";
import { Login } from "./Pages/Login/Login";
import { SpacetimeContextType } from "./Types/General/SpacetimeContextType";
import { Callback } from "./Pages/Callback/Callback";
import { Canvas } from "./Pages/Canvas/Canvas";

export const App: React.FC = () => {
  const [spacetimeDB, setSpacetimeDB] = useState<SpacetimeContextType | undefined>(undefined);

  // CONFIGS
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);
  const [settings, setSettings] = useState<any>(
    JSON.parse(localStorage.getItem("settings")!) || {
      debug: false,
      cursorName: true,
      compressUpload: true,
      compressPaste: true,
    }
  );

  useGetConnectionConfig(setConnectionConfig);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/callback" element={<Callback />} />

        <Route path="/" errorElement={<Error />}>
          <Route index element={<Navigate to="/canvas" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="canvas" element={<Canvas />} />
        </Route>
      </>
    )
  );

  return (
    <SpacetimeContext.Provider value={{ spacetimeDB, setSpacetimeDB }}>
      <ConfigContext.Provider value={{ connectionConfig, setConnectionConfig }}>
        <SettingsContext.Provider value={{ settings, setSettings }}>
          <RouterProvider router={router} />
          <ToastContainer />
        </SettingsContext.Provider>
      </ConfigContext.Provider>
    </SpacetimeContext.Provider>
  );
};
