import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Editor } from "./editor/Editor";
import { Canvas } from "./pages/Canvas";
import { Overlay } from "./pages/Overlay";
import { NotFound } from "./pages/404";

export const App: React.FC = () => {
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

  return <RouterProvider future={{ v7_startTransition: true }} router={router} />;
};
