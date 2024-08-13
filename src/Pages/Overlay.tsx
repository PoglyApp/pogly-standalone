import { useAppSelector } from "../Store/Features/store";
import { useOverlayElementsEvents } from "../StDB/Hooks/useOverlayElementsEvents";
import { useOverlayElementDataEvents } from "../StDB/Hooks/useOverlayElementDataEvents";
import { useEffect, useState } from "react";
import useFetchElement from "../StDB/Hooks/useFetchElements";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { Loading } from "../Components/General/Loading";
import { CanvasInitializedType } from "../Types/General/CanvasInitializedType";
import { useHeartbeatEvents } from "../StDB/Hooks/useHeartbeatEvents";
import Layouts from "../module_bindings/layouts";
import { useOverlayLayoutEvents } from "../StDB/Hooks/useOverlayLayoutEvents";

export const Overlay = () => {
  const [canvasInitialized, setCanvasInitialized] = useState<CanvasInitializedType>({
    overlayElementDataEventsInitialized: false,
    overlayElementEventsInitialized: false,
  });

  const canvasElements: CanvasElementType[] = useAppSelector((state: any) => state.canvasElements.canvasElements);

  const [activeLayout, setActiveLayout] = useState<Layouts>();

  useFetchElement(activeLayout, canvasInitialized, setCanvasInitialized);

  useOverlayElementDataEvents(canvasInitialized, setCanvasInitialized);
  useOverlayElementsEvents(activeLayout!, canvasInitialized, setCanvasInitialized);
  useOverlayLayoutEvents(activeLayout, setActiveLayout);

  useHeartbeatEvents(canvasInitialized);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");

    if (layoutParam) {
      setActiveLayout(Layouts.filterByName(layoutParam).next().value);
    } else {
      setActiveLayout(Layouts.filterByActive(true).next().value);
    }
  }, []);

  return (
    <>
      {canvasInitialized.elementsFetchInitialized ? (
        <>
          <div className="elementContent">
            {canvasElements.map((element: CanvasElementType) => {
              return <div key={element.Elements.id.toString()}>{element.Component}</div>;
            })}
          </div>
        </>
      ) : (
        <Loading text="Loading..." />
      )}
    </>
  );
};
