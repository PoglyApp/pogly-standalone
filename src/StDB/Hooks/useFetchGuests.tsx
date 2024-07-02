import { useContext, useEffect } from "react";
import Guests from "../../module_bindings/guests";
import { useAppDispatch } from "../../Store/Features/store";
import { initGuests } from "../../Store/Features/GuestSlice";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { IdentityContext } from "../../Contexts/IdentityContext";

const useFetchGuests = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const identity = useContext(IdentityContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!identity || canvasInitialized.guestFetchInitialized) return;

    const guests = Guests.all();

    const guest = guests.findIndex((g) => g.identity.toHexString() === identity.identity.toHexString());

    guests[guest].nickname = identity.nickname;

    dispatch(initGuests(guests));

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, guestFetchInitialized: true }));
  }, [identity, canvasInitialized.guestFetchInitialized, setCanvasInitialized, dispatch]);
};

export default useFetchGuests;
