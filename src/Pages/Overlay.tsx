import { useEffect, useState } from "react";
import { DebugLogger } from "../Utility/DebugLogger";
import useStDB from "../StDB/useStDB";
import { useGetConnectionConfig } from "../Hooks/useGetConnectionConfig";
import { ConnectionConfigType } from "../Types/ConfigTypes/ConnectionConfigType";
import useFetchElement from "../StDB/Hooks/useFetchElementsNEW";
import { SetSubscriptions } from "../Utility/SetSubscriptions";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";
import { useOverlayGuestsEvents } from "../StDB/Hooks/useOverlayGuestsEvents";
import { useOverlayElementsEvents } from "../StDB/Hooks/useOverlayElementsEvents";
import { useOverlayLayoutEvents } from "../StDB/Hooks/useOverlayLayoutEvents";
import { useOverlayHeartbeatEvents } from "../StDB/Hooks/useOverlayHeartbeatEvents";

export const Overlay = () => {
  const [stdbConnected, setStdbConnected] = useState<boolean>(false);
  const [subscriptionsApplied, setSubscriptionsApplied] = useState<boolean>(false);
  const [userDisconnected, setUserDisconnected] = useState<boolean>(false);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfigType | undefined>(undefined);

  useGetConnectionConfig(setConnectionConfig);

  const spacetimeDB = useStDB(connectionConfig, setStdbConnected);

  const [elements, setElements] = useState<CanvasElementType[]>([]);
  const [refetchElements, setRefetchElements] = useState<boolean>(true);

  useFetchElement(spacetimeDB.Client, subscriptionsApplied, setElements, refetchElements, setRefetchElements);

  useOverlayElementsEvents(setElements, spacetimeDB.Client, subscriptionsApplied);
  useOverlayGuestsEvents(spacetimeDB, setUserDisconnected);
  useOverlayLayoutEvents(spacetimeDB, setRefetchElements);
  useOverlayHeartbeatEvents(spacetimeDB);

  useEffect(() => {
    if (!spacetimeDB || !spacetimeDB.Client) return;

    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");
    const transparent = urlParams.get("transparent");
    const nickname = urlParams.get("nickname");

    SetSubscriptions(spacetimeDB.Client, setSubscriptionsApplied);

    spacetimeDB.Client.reducers.clearRefreshOverlayRequests();

    if (transparent != null) {
      document.body.style.backgroundColor = "rgba(0, 0, 0, 0)";
      document.documentElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
    }

    if (nickname != null) {
      spacetimeDB.Client.reducers.updateGuestNickname(nickname);
    }
  }, [spacetimeDB, spacetimeDB.Client]);

  useEffect(() => {
    if (userDisconnected || spacetimeDB.Disconnected) {
      DebugLogger("Overlay is disconnected");
      localStorage.removeItem("stdbToken");
      window.location.reload();
    }
  }, [userDisconnected, spacetimeDB.Disconnected]);

  return (
    <SpacetimeContext.Provider value={{ spacetimeDB }}>
      <div className="elementContent">
        {elements.map((element: CanvasElementType) => {
          return <div key={element.Elements.id.toString()}>{element.Component}</div>;
        })}
      </div>
    </SpacetimeContext.Provider>
  );
};
