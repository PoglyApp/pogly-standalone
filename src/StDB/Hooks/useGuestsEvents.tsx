import { useContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Guests from "../../module_bindings/guests";
import { useAppDispatch } from "../../Store/Features/store";
import { addGuest, removeGuest, updateGuest } from "../../Store/Features/GuestSlice";
import handleElementBorder from "../../Utility/HandleElementBorder";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { IdentityContext } from "../../Contexts/IdentityContext";
import { GetTransformFromCoords } from "../../Utility/ConvertCoordinates";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

export const useGuestsEvents = (
  canvasInitialized: CanvasInitializedType,
  setCanvasInitialized: Function,
  transformRef: React.RefObject<ReactZoomPanPinchRef>
) => {
  const identityContext = useContext(IdentityContext);
  const dispatch = useAppDispatch();

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    if (isOverlay || canvasInitialized.guestEventsInitialized) return;

    Guests.onInsert((newGuest) => {
      dispatch(addGuest(newGuest));
    });

    Guests.onUpdate((oldGuest, newGuest) => {
      if (newGuest.identity.toHexString() === identityContext.identity?.toHexString()) return;

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
        handleElementBorder(identityContext.identity, oldGuest.selectedElementId.toString());

        // Handle new element
        handleElementBorder(identityContext.identity, newGuest.selectedElementId.toString());
      }

      // IF CURSOR POSITION IS UPDATED
      if (oldGuest.positionX !== newGuest.positionX || oldGuest.positionY !== newGuest.positionY) {
        const cursor = document.getElementById(`${newGuest.nickname}_cursor`);

        if (!cursor || !transformRef.current) return;

        const transform = GetTransformFromCoords(
          newGuest.positionX * transformRef.current.instance.transformState.scale,
          newGuest.positionY * transformRef.current.instance.transformState.scale,
          0,
          null,
          null
        );

        cursor.setAttribute("data-raw-positionX", newGuest.positionX.toString());
        cursor.setAttribute("data-raw-positionY", newGuest.positionY.toString());
        cursor.style.transform = transform;
        cursor.style.position = "fixed";
      }
    });

    Guests.onDelete((guest, reducerEvent) => {
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

      handleElementBorder(identityContext.identity, guest.selectedElementId.toString());

      dispatch(removeGuest(guest));
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, guestEventsInitialized: true }));
  }, [
    canvasInitialized.guestEventsInitialized,
    identityContext.identity,
    isOverlay,
    transformRef,
    setCanvasInitialized,
    dispatch,
  ]);
};
