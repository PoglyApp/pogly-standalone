import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { Editor } from "./editor/Editor";
import { Canvas } from "./pages/Canvas";
import { Overlay } from "./pages/Overlay";
import { NotFound } from "./pages/404";
import { useState } from "react";
import { useGetConnectionConfig } from "./hooks/useGetConnectionConfig.tsx";
import { ConnectionConfigType } from "./types/ConfigTypes/ConnectionConfigType.ts";
import { Login } from "./pages/login/Login.tsx";
import { Callback } from "./pages/callback/Callback.tsx";
import { Error } from "./pages/error/Error.tsx";
import { ConfigContext } from "./contexts/ConfigContext.ts";
import { SpacetimeContextType } from "./types/General/SpacetimeContextType.ts";
import Layouts from "./module_bindings/layouts_type.ts";
import { SpacetimeContext } from "./contexts/SpacetimeContext.ts";
import { LayoutContext } from "./contexts/LayoutContext.ts";

export const App: React.FC = () => {
  const [spacetimeDB, setSpacetimeDB] = useState<SpacetimeContextType | undefined>(undefined);
  const [activeLayout, setActiveLayout] = useState<Layouts | undefined>(undefined);

  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);

  useGetConnectionConfig(setConnectionConfig);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Auth routes (no Editor layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />

        {/* Editor layout and its children */}
        <Route path="/" element={<Editor />} errorElement={<Error />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="canvas" element={<Canvas />} />
          <Route path="overlay" element={<Overlay />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </>
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

  return (
    <SpacetimeContext.Provider value={{ spacetimeDB, setSpacetimeDB }}>
      <ConfigContext.Provider value={{ connectionConfig, setConnectionConfig }}>
        <LayoutContext.Provider value={{ activeLayout, setActiveLayout }}>
          <RouterProvider future={{ v7_startTransition: true }} router={router} />
        </LayoutContext.Provider>
      </ConfigContext.Provider>
    </SpacetimeContext.Provider>
  );
};
