import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { EventContext, Guests } from "@/module_bindings";
import { useContext, useEffect, useState } from "react";

type SetGuestList = React.Dispatch<React.SetStateAction<Guests[]>>;

export const useGuestEvents = (setGuestList: SetGuestList) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    // INSERT
    spacetimeDB.Client.db.guests.onInsert((ctx: EventContext, guest: Guests) => {
      if (!ctx.event) return;

      setGuestList((prev) => [...prev, guest]);
    });

    // UPDATE
    spacetimeDB.Client.db.guests.onUpdate((ctx: EventContext, oldGuest: Guests, newGuest: Guests) => {
      if (!ctx.event) return;

      setGuestList((prev) =>
        prev.map((g) => (g.identity.toHexString() === newGuest.identity.toHexString() ? newGuest : g))
      );
    });

    // DELETE
    spacetimeDB.Client.db.guests.onDelete((ctx: EventContext, guest: Guests) => {
      if (!ctx.event) return;

      setGuestList((prev) => prev.filter((g) => g.identity.toHexString() !== guest.identity.toHexString()));
    });
  }, [spacetimeDB, initialized]);
};
