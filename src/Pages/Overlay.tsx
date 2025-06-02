import { useEffect, useState } from "react";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { Loading } from "../Components/General/Loading";
import { DebugLogger } from "../Utility/DebugLogger";
import { ElementData, Elements, Layouts } from "../module_bindings";
import useStDB from "../StDB/useStDB";
import { useGetConnectionConfig } from "../Hooks/useGetConnectionConfig";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";
import useFetchElement from "../StDB/Hooks/useFetchElementsNEW";
import { SetSubscriptions } from "../Utility/SetSubscriptions";

export const Overlay = () => {
  const [stdbConnected, setStdbConnected] = useState<boolean>(false);
  const [subscriptionsApplied, setSubscriptionsApplied] = useState<boolean>(false);
  const [userDisconnected, setUserDisconnected] = useState<boolean>(false);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);

  useGetConnectionConfig(setConnectionConfig);
  const spacetimeDB = useStDB(connectionConfig, setStdbConnected);

  const [elements, setElements] = useState<Elements[]>([]);
  const [elementData, setElementData] = useState<ElementData[]>([]);

  useFetchElement(spacetimeDB.Client, subscriptionsApplied, setElements, setElementData);

  // useOverlayFetchElement(spacetimeDB, activeLayout, canvasInitialized, setCanvasInitialized);
  // useOverlayElementDataEvents(spacetimeDB, canvasInitialized, setCanvasInitialized);
  // useOverlayElementsEvents(spacetimeDB, activeLayout, canvasInitialized, setCanvasInitialized);
  // useOverlayLayoutEvents(spacetimeDB, activeLayout, setActiveLayout);
  // setUserDisconnected(useOverlayGuestsEvents(spacetimeDB, canvasInitialized, setCanvasInitialized));
  // useOverlayHeartbeatEvents(spacetimeDB, canvasInitialized);

  /*
      const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");
    const transparent = urlParams.get("transparent");

    if (layoutParam) {
      DebugLogger("Getting layout by name");
      setActiveLayout(
        (Array.from(spacetimeDB.Client.db.layouts.iter()) as Layouts[]).find((l: Layouts) => l.name === layoutParam)
      );
    } else {
      DebugLogger("Getting layout by active ID");
      setActiveLayout(
        (Array.from(spacetimeDB.Client.db.layouts.iter()) as Layouts[]).find((l: Layouts) => l.active === true)
      );
    }
  */

  useEffect(() => {
    if (!spacetimeDB || !spacetimeDB.Client) return;

    SetSubscriptions(spacetimeDB.Client, setSubscriptionsApplied);
    spacetimeDB.Client.reducers.clearRefreshOverlayRequests();
  }, [spacetimeDB, spacetimeDB.Client]);

  useEffect(() => {
    console.log("Elements", elements);
    console.log("ElementData", elementData);
  }, [elements, elementData]);

  if (userDisconnected || spacetimeDB.Disconnected) {
    DebugLogger("Overlay is disconnected");
    localStorage.removeItem("stdbToken");
    window.location.reload();
  }

  if (!stdbConnected) return <></>;

  /*return (
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
  );*/
};
