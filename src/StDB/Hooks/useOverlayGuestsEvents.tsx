import { useEffect, useState } from "react";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Guests } from "../../module_bindings";

export const useOverlayGuestsEvents = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const { Identity, Client } = useSpacetimeContext();
  const [disconnected, setDisconnected] = useState<boolean>(false);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    if (canvasInitialized.overlayGuestEventsInitialized) return;

    DebugLogger("Initializing overlay guest events");

    Client.db.guests.onDelete((ctx: EventContext, guest: Guests) => {
      if (isOverlay && guest.address.toHexString() === Identity.address.toHexString()) {
        setDisconnected(true);
      }
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, overlayGuestEventsInitialized: true }));
  }, [canvasInitialized.overlayGuestEventsInitialized, Identity.identity, Identity.address, isOverlay, setCanvasInitialized]);

  return disconnected;
};
