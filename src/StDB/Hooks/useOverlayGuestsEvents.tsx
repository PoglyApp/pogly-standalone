import { useEffect, useState } from "react";
import Guests from "../../module_bindings/guests";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";

export const useOverlayGuestsEvents = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const { Identity } = useSpacetimeContext();
  const [disconnected, setDisconnected] = useState<boolean>(false);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    if (canvasInitialized.overlayGuestEventsInitialized) return;

    DebugLogger("Initializing overlay guest events");

    Guests.onDelete((guest) => {
      if (isOverlay && guest.address.toHexString() === Identity.address.toHexString()) {
        setDisconnected(true);
      }
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, overlayGuestEventsInitialized: true }));
  }, [canvasInitialized.overlayGuestEventsInitialized, Identity.identity, Identity.address, isOverlay, setCanvasInitialized]);

  return disconnected;
};
