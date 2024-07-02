import { useContext, useEffect } from "react";
import { IdentityContext } from "../../Contexts/IdentityContext";
import Heartbeat from "../../module_bindings/heartbeat";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";

export const useHeartbeatEvents = (canvasInitialized: CanvasInitializedType) => {
  const identity = useContext(IdentityContext);

  useEffect(() => {
    if (!identity || canvasInitialized.elementEventsInitialized) return;

    Heartbeat.onUpdate((oldElement, newElement, reducerEvent) => {
      //console.log(newElement.tick);
    });
  }, [identity, canvasInitialized.elementEventsInitialized]);
};
