import { useAppSelector } from "../Store/Features/store";
import { useOverlayElementsEvents } from "../StDB/Hooks/useOverlayElementsEvents";
import { useOverlayElementDataEvents } from "../StDB/Hooks/useOverlayElementDataEvents";
import { useContext, useEffect, useState } from "react";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { Loading } from "../Components/General/Loading";
import { CanvasInitializedType } from "../Types/General/CanvasInitializedType";
import { useOverlayHeartbeatEvents } from "../StDB/Hooks/useOverlayHeartbeatEvents";
import { useOverlayLayoutEvents } from "../StDB/Hooks/useOverlayLayoutEvents";
import { useOverlayGuestsEvents } from "../StDB/Hooks/useOverlayGuestsEvents";
import { DebugLogger } from "../Utility/DebugLogger";
import { Layouts } from "../module_bindings";
import { useNavigate } from "react-router-dom";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";
import useStDB from "../StDB/useStDB";
import useOverlayFetchElement from "../StDB/Hooks/useOverlayFetchElements";
import { useGetConnectionConfig } from "../Hooks/useGetConnectionConfig";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";

export const Overlay = () => {
  const [canvasInitialized, setCanvasInitialized] = useState<CanvasInitializedType>({
    overlayElementDataEventsInitialized: false,
    overlayElementEventsInitialized: false,
    overlayGuestEventsInitialized: false,
  });
  //const { spacetimeDB } = useContext(SpacetimeContext);

  const [stdbConnected, setStdbConnected] = useState<boolean>(false);
  const [stdbAuthenticated, setStdbAuthenticated] = useState<boolean>(false);
  const [instanceConfigured, setInstanceConfigured] = useState<boolean>(false);
  const [userDisconnected, setUserDisconnected] = useState<boolean>(false);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);

  useGetConnectionConfig(setConnectionConfig);
  const spacetimeDB = useStDB(connectionConfig, setStdbConnected, setStdbAuthenticated, setInstanceConfigured);

  const canvasElements: CanvasElementType[] = useAppSelector((state: any) => state.canvasElements.canvasElements);
  const [activeLayout, setActiveLayout] = useState<Layouts>();

  useEffect(() => {
    if (!spacetimeDB) return;
    if (!spacetimeDB.Client) return;

    // useOverlayFetchElement(spacetimeDB, activeLayout, canvasInitialized, setCanvasInitialized);
    // useOverlayElementDataEvents(spacetimeDB, canvasInitialized, setCanvasInitialized);
    // useOverlayElementsEvents(spacetimeDB, activeLayout, canvasInitialized, setCanvasInitialized);
    // useOverlayLayoutEvents(spacetimeDB, activeLayout, setActiveLayout);
    // setUserDisconnected(useOverlayGuestsEvents(spacetimeDB, canvasInitialized, setCanvasInitialized));
    // useOverlayHeartbeatEvents(spacetimeDB, canvasInitialized);

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
  }, [spacetimeDB, spacetimeDB.Client]);

  if (userDisconnected || spacetimeDB.Disconnected) {
    DebugLogger("Overlay is disconnected");
    localStorage.removeItem("stdbToken");
    window.location.reload();
  }

  if(!stdbConnected) return <></>;
  if(!instanceConfigured) return <></>;

  console.log("we did it");

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
