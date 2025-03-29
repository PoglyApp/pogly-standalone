import { useContext, useEffect } from "react";
import { useAppDispatch } from "../../Store/Features/store";
import { initGuests } from "../../Store/Features/GuestSlice";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { Guests } from "../../module_bindings";

const useFetchGuests = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!spacetimeDB.Identity.identity || canvasInitialized.guestFetchInitialized) return;

    DebugLogger("Fetching guests");

    const guests: Guests[] = Array.from(spacetimeDB.Client.db.guests.iter());

    //const guest = guests.findIndex((g) => g.address.toHexString() === spacetimeDB.Identity.address.toHexString());
    //guests[guest].nickname = spacetimeDB.Identity.nickname;

    dispatch(initGuests(guests));

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, guestFetchInitialized: true }));
  }, [spacetimeDB.Identity, canvasInitialized.guestFetchInitialized, setCanvasInitialized, dispatch, spacetimeDB.Client]);
};

export default useFetchGuests;
