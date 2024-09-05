import { useEffect } from "react";
import Guests from "../../module_bindings/guests";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";

export const useOverlayGuestsEvents = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const { Identity } = useSpacetimeContext();

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    if (canvasInitialized.overlayGuestEventsInitialized) return;

    DebugLogger("Initializing overlay guest events");

    Guests.onDelete((guest) => {
      if (isOverlay && guest.identity.toHexString() === Identity.identity.toHexString()) window.location.reload();
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, overlayGuestEventsInitialized: true }));
  }, [canvasInitialized.overlayGuestEventsInitialized, Identity.identity, isOverlay, setCanvasInitialized]);
};
