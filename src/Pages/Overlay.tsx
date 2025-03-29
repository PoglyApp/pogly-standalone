import { useAppSelector } from "../Store/Features/store";
import { useOverlayElementsEvents } from "../StDB/Hooks/useOverlayElementsEvents";
import { useOverlayElementDataEvents } from "../StDB/Hooks/useOverlayElementDataEvents";
import { useContext, useEffect, useState } from "react";
import useFetchElement from "../StDB/Hooks/useFetchElements";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { Loading } from "../Components/General/Loading";
import { CanvasInitializedType } from "../Types/General/CanvasInitializedType";
import { useHeartbeatEvents } from "../StDB/Hooks/useHeartbeatEvents";
import { useOverlayLayoutEvents } from "../StDB/Hooks/useOverlayLayoutEvents";
import { useOverlayGuestsEvents } from "../StDB/Hooks/useOverlayGuestsEvents";
import { DebugLogger } from "../Utility/DebugLogger";
import { Layouts } from "../module_bindings";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";

export const Overlay = () => {
  const [canvasInitialized, setCanvasInitialized] = useState<CanvasInitializedType>({
    overlayElementDataEventsInitialized: false,
    overlayElementEventsInitialized: false,
    overlayGuestEventsInitialized: false,
  });
  const { spacetimeDB } = useContext(SpacetimeContext);

  const canvasElements: CanvasElementType[] = useAppSelector((state: any) => state.canvasElements.canvasElements);

  const [activeLayout, setActiveLayout] = useState<Layouts>();

  useFetchElement(activeLayout, canvasInitialized, setCanvasInitialized);

  useOverlayElementDataEvents(canvasInitialized, setCanvasInitialized);
  useOverlayElementsEvents(activeLayout, canvasInitialized, setCanvasInitialized);
  useOverlayLayoutEvents(activeLayout, setActiveLayout);
  const userDisconnected = useOverlayGuestsEvents(canvasInitialized, setCanvasInitialized);

  useHeartbeatEvents(canvasInitialized);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");
    const transparent = urlParams.get("transparent");

    spacetimeDB.Client.reducers.clearRefreshOverlayRequests();

    if (layoutParam) {
      DebugLogger("Getting layout by name");
      setActiveLayout((Array.from(spacetimeDB.Client.db.layouts.iter()) as Layouts[]).find((l: Layouts) => l.name === layoutParam));
    } else {
      DebugLogger("Getting layout by active ID");
      setActiveLayout((Array.from(spacetimeDB.Client.db.layouts.iter()) as Layouts[]).find((l: Layouts) => l.active === true));
    }

    if (transparent != null) {
      document.body.style.backgroundColor = "rgba(0, 0, 0, 0)";
      document.documentElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
    }
  }, [spacetimeDB.Client]);

  if (userDisconnected || spacetimeDB.Disconnected) {
    DebugLogger("Overlay is disconnected");
    localStorage.removeItem("stdbToken");
    window.location.reload();
  }

  return (
    <>
      {canvasInitialized.elementsFetchInitialized ? (
        <>
          <div className="elementContent">
            {canvasElements.map((element: CanvasElementType) => {
              return <div key={element.Elements.id.toString()}>{element.Component}</div>;
            })}
          </div>
        </>
      ) : (
        <Loading text="Loading..." />
      )}
    </>
  );
};
