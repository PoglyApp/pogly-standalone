import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../Store/Features/store";
import { addGuest, removeGuest, updateGuest, updateGuestLayout } from "../../Store/Features/GuestSlice";
import handleElementBorder from "../../Utility/HandleElementBorder";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { GetTransformFromCoords } from "../../Utility/ConvertCoordinates";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Guests } from "../../module_bindings";

export const useGuestsEvents = (
  canvasInitialized: CanvasInitializedType,
  setCanvasInitialized: Function,
  transformRef: React.RefObject<ReactZoomPanPinchRef>
) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const [disconnected, setDisconnected] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    if (isOverlay || canvasInitialized.guestEventsInitialized) return;

    DebugLogger("Initializing guest events");

    spacetimeDB.Client.db.guests.onInsert((ctx: EventContext, newGuest: Guests) => {
      dispatch(addGuest(newGuest));
    });

    spacetimeDB.Client.db.guests.onUpdate((ctx: EventContext, oldGuest: Guests, newGuest: Guests) => {
      if (newGuest.address.toHexString() === spacetimeDB.Identity.address.toHexString()) return;

      // IF NICKNAME IS UPDATED
      if (oldGuest.nickname === "" && newGuest.nickname !== "") {
        toast.success(`${newGuest.nickname} connected!`, {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });

        dispatch(updateGuest(newGuest));
      }

      // IF SELECTED ELEMENT IS UPDATED
      if (oldGuest.selectedElementId !== newGuest.selectedElementId) {
        // Handle old element
        handleElementBorder(spacetimeDB.Client, spacetimeDB.Identity.address, oldGuest.selectedElementId.toString());

        // Handle new element
        handleElementBorder(spacetimeDB.Client, spacetimeDB.Identity.address, newGuest.selectedElementId.toString());
      }

      // IF CURSOR POSITION IS UPDATED
      if (oldGuest.positionX !== newGuest.positionX || oldGuest.positionY !== newGuest.positionY) {
        const cursor = document.getElementById(`${newGuest.nickname}_cursor`);

        if (!cursor || !transformRef.current) return;

        const transform = GetTransformFromCoords(
          newGuest.positionX * transformRef.current.instance.transformState.scale,
          newGuest.positionY * transformRef.current.instance.transformState.scale,
          0,
          false,
          false,
          null,
          null
        );

        cursor.setAttribute("data-raw-positionX", newGuest.positionX.toString());
        cursor.setAttribute("data-raw-positionY", newGuest.positionY.toString());
        cursor.style.transform = transform;
        cursor.style.position = "fixed";
      }

      // UPDATE GUEST SELECTED LAYOUT
      if (oldGuest.selectedLayoutId !== newGuest.selectedLayoutId) {
        dispatch(updateGuestLayout(newGuest));
      }
    });

    spacetimeDB.Client.db.guests.onDelete((ctx: EventContext, guest: Guests) => {
      toast.success(`${guest.nickname === "" ? "Streamer" : guest.nickname} disconnected!`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      handleElementBorder(spacetimeDB.Client, spacetimeDB.Identity.address, guest.selectedElementId.toString());

      dispatch(removeGuest(guest));

      if (guest.address.toHexString() === spacetimeDB.Identity.address.toHexString()) {
        setDisconnected(true);
      }
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, guestEventsInitialized: true }));
  }, [
    canvasInitialized.guestEventsInitialized,
    spacetimeDB.Identity.identity,
    spacetimeDB.Identity.address,
    isOverlay,
    transformRef,
    setCanvasInitialized,
    dispatch,
    spacetimeDB.Identity.selectedLayoutId,
    spacetimeDB.Client
  ]);

  return disconnected;
};
