import { useContext, useEffect } from "react";
import { useAppDispatch } from "../../Store/Features/store";
import { initGuests } from "../../Store/Features/GuestSlice";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { SpacetimeContextType } from "../../Types/General/SpacetimeContextType";

const useFetchGuests = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const spacetimeDB: SpacetimeContextType = useContext(SpacetimeContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!spacetimeDB.Identity.identity || canvasInitialized.guestFetchInitialized) return;

    DebugLogger("Fetching guests");

    const guests: any[] = Array.from(spacetimeDB.Client.db.guests.iter());

    const updatedGuests = guests.map((g: any) => g.address.toHexString() === spacetimeDB.Identity.address.toHexString()
      ? { ...g, nickname: spacetimeDB.Identity.nickname}
      : g
    );

    dispatch(initGuests(updatedGuests));

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, guestFetchInitialized: true }));
  }, [spacetimeDB.Identity, canvasInitialized.guestFetchInitialized, setCanvasInitialized, dispatch, spacetimeDB.Client]);
};

export default useFetchGuests;
