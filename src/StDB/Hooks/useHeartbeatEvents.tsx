import { useEffect } from "react";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import Heartbeat from "../../module_bindings/heartbeat";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";

export const useHeartbeatEvents = (canvasInitialized: CanvasInitializedType) => {
  const { Identity } = useSpacetimeContext();

  useEffect(() => {
    if (!Identity || canvasInitialized.elementEventsInitialized) return;

    Heartbeat.onUpdate((oldElement, newElement, reducerEvent) => {
      //console.log(newElement.tick);
    });
  }, [Identity, canvasInitialized.elementEventsInitialized]);
};
