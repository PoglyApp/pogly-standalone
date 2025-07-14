import { useEffect, useState } from "react";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Guests } from "../../module_bindings";

export const useOverlayGuestsEvents = (spacetimeDB: any) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [disconnected, setDisconnected] = useState<boolean>(false);

  useEffect(() => {
    if (initialized || !spacetimeDB) return;
    DebugLogger("Initializing overlay guest events");

    spacetimeDB.Client.db.guests.onDelete((ctx: EventContext, guest: Guests) => {
      if (guest.address.toHexString() === spacetimeDB.Identity.address.toHexString()) {
        setDisconnected(true);
      }
    });

    setInitialized(true);
  }, [spacetimeDB.Identity.identity, spacetimeDB.Identity.address, spacetimeDB.Client]);

  return disconnected;
};
