import { useEffect, useState } from "react";
import { EventContext, Guests } from "../../module_bindings";

export const useOverlayGuestsEvents = (spacetimeDB: any, setDisconnected: Function) => {
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (initialized || !spacetimeDB.Client) return;

    spacetimeDB.Client.db.guests.onDelete((ctx: EventContext, guest: Guests) => {
      if (guest.address.toHexString() === spacetimeDB.Identity.address.toHexString()) {
        setDisconnected(true);
      }
    });

    setInitialized(true);
  }, [spacetimeDB.Client]);
};
