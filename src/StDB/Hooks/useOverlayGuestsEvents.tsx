import { useContext, useEffect, useState } from "react";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Guests } from "../../module_bindings";

export const useOverlayGuestsEvents = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const [disconnected, setDisconnected] = useState<boolean>(false);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    if (canvasInitialized.overlayGuestEventsInitialized) return;

    DebugLogger("Initializing overlay guest events");

    spacetimeDB.Client.db.guests.onDelete((ctx: EventContext, guest: Guests) => {
      if (isOverlay && guest.address.toHexString() === spacetimeDB.Identity.address.toHexString()) {
        setDisconnected(true);
      }
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, overlayGuestEventsInitialized: true }));
  }, [canvasInitialized.overlayGuestEventsInitialized, spacetimeDB.dentity.identity, spacetimeDB.Identity.address, isOverlay, setCanvasInitialized, spacetimeDB.Client]);

  return disconnected;
};
