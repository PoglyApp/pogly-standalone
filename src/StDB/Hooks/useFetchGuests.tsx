import { useEffect } from "react";
import Guests from "../../module_bindings/guests";
import { useAppDispatch } from "../../Store/Features/store";
import { initGuests } from "../../Store/Features/GuestSlice";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";

const useFetchGuests = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const { Identity } = useSpacetimeContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!Identity.identity || canvasInitialized.guestFetchInitialized) return;

    DebugLogger("Fetching guests");

    const guests = Guests.all();

    const guest = guests.findIndex((g) => g.address.toHexString() === Identity.address.toHexString());

    guests[guest].nickname = Identity.nickname;

    dispatch(initGuests(guests));

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, guestFetchInitialized: true }));
  }, [Identity, canvasInitialized.guestFetchInitialized, setCanvasInitialized, dispatch]);
};

export default useFetchGuests;
