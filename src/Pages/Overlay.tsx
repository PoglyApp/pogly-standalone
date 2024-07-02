import { useAppDispatch, useAppSelector } from "../Store/Features/store";
import Elements from "../module_bindings/elements";
import { useOverlayElementsEvents } from "../StDB/Hooks/useOverlayElementsEvents";
import { useOverlayElementDataEvents } from "../StDB/Hooks/useOverlayElementDataEvents";
import { useEffect, useState } from "react";
import useFetchElement from "../StDB/Hooks/useFetchElements";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { CreateElementComponent } from "../Utility/CreateElementComponent";
import { initCanvasElements } from "../Store/Features/CanvasElementSlice";
import { Loading } from "../Components/General/Loading";
import { CanvasInitializedType } from "../Types/General/CanvasInitializedType";
import { useHeartbeatEvents } from "../StDB/Hooks/useHeartbeatEvents";

export const Overlay = () => {
  const dispatch = useAppDispatch();

  const [canvasInitialized, setCanvasInitialized] = useState<CanvasInitializedType>({
    overlayElementDataEventsInitialized: false,
    overlayElementEventsInitialized: false,
  });

  const elements: Elements[] = useAppSelector((state: any) => state.elements.elements);

  const canvasElements: CanvasElementType[] = useAppSelector((state: any) => state.canvasElements.canvasElements);

  useFetchElement(canvasInitialized, setCanvasInitialized);

  useOverlayElementDataEvents(canvasInitialized, setCanvasInitialized);
  useOverlayElementsEvents(canvasInitialized, setCanvasInitialized);

  useHeartbeatEvents(canvasInitialized);

  useEffect(() => {
    if (!canvasInitialized.elementsFetchInitialized) return;

    // INITIALIZE CANVAS
    const canvasElements: CanvasElementType[] = [];

    elements.forEach((element: Elements) => {
      canvasElements.push(CreateElementComponent(element));
    });

    dispatch(initCanvasElements(canvasElements));
  }, [canvasInitialized.elementsFetchInitialized, elements, dispatch]);

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
