import "react-toastify/dist/ReactToastify.css";

import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider, Navigate } from "react-router-dom";
import React, { ReactNode, useContext, useState } from "react";

import { Canvas } from "./Pages/Canvas";
import { Header } from "./Header/Header";

import { Overlay } from "./Pages/Overlay";
import { useGetConnectionConfig } from "./Hooks/useGetConnectionConfig";
import { ConnectionConfigType } from "./Types/ConfigTypes/ConnectionConfigType";
import { ToastContainer } from "react-toastify";
import { SpacetimeContext } from "./Contexts/SpacetimeContext";
import { ConfigContext } from "./Contexts/ConfigContext";
import { SettingsContext } from "./Contexts/SettingsContext";
import { ModalContext } from "./Contexts/ModalContext";
import { NotFound } from "./Pages/NotFound";
import { LayoutContext } from "./Contexts/LayoutContext";
import { Error } from "./Pages/Error/Error";
import { Login } from "./Pages/Login/Login";
import { SpacetimeContextType } from "./Types/General/SpacetimeContextType";
import { Callback } from "./Pages/Callback/Callback";
import { Layouts } from "./module_bindings";

export const App: React.FC = () => {
  const { closeModal } = useContext(ModalContext);
  const [modals, setModals] = useState<ReactNode[]>([]);

  const [spacetimeDB, setSpacetimeDB] = useState<SpacetimeContextType | undefined>(undefined);
  const [activeLayout, setActiveLayout] = useState<Layouts | undefined>(undefined)

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
      <Route path="/" element={<Header />} errorElement={<Error />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="callback" element={<Callback />} />
        <Route path="canvas" element={<Canvas />} />
        <Route path="overlay" element={<Overlay />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  return (
    <SpacetimeContext.Provider value={{ spacetimeDB, setSpacetimeDB }}>
      <ConfigContext.Provider value={{ connectionConfig, setConnectionConfig }}>
        <SettingsContext.Provider value={{ settings, setSettings }}>
          <LayoutContext.Provider value={{ activeLayout, setActiveLayout }}>
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
