import { useEffect } from "react";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Heartbeat } from "../../module_bindings";

export const useHeartbeatEvents = (canvasInitialized: CanvasInitializedType) => {
  const { Identity, Client } = useSpacetimeContext();

  useEffect(() => {
    if (!Identity || canvasInitialized.elementEventsInitialized) return;

    DebugLogger("Initializing heartbeat");

    let internalBeat = 0;

    Client.db.heartbeat.onInsert((ctx: EventContext, beat: Heartbeat) => {
      const isOverlay: Boolean = window.location.href.includes("/overlay");

      if (isOverlay && beat.tick === 1337) window.location.reload();

      if (isOverlay && beat.tick === 69420) {
        localStorage.clear();
        window.location.reload();
      }
    });

    Client.db.heartbeat.onUpdate((ctx: EventContext, oldElement: Heartbeat, newElement: Heartbeat) => {
      internalBeat = newElement.tick;
    });
  }, [Identity, canvasInitialized.elementEventsInitialized]);
};
