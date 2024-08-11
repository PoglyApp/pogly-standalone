import { useEffect, useState } from "react";
import Elements from "../../module_bindings/elements";
import ElementData from "../../module_bindings/element_data";
import { initData } from "../../Store/Features/ElementDataSlice";
import { initElements } from "../../Store/Features/ElementsSlice";
import { useAppDispatch } from "../../Store/Features/store";
import { OffsetElementForCanvas } from "../../Utility/OffsetElementForCanvas";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import Layouts from "../../module_bindings/layouts";
import { CanvasElementType } from "../../Types/General/CanvasElementType";
import { CreateElementComponent } from "../../Utility/CreateElementComponent";
import { initCanvasElements } from "../../Store/Features/CanvasElementSlice";

const useFetchElement = (
  layout: Layouts | undefined,
  canvasInitialized: CanvasInitializedType,
  setCanvasInitialized: Function
) => {
  const dispatch = useAppDispatch();
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [fetchedLayout, setFetchedLayout] = useState<Layouts>();

  useEffect(() => {
    if (!layout) return;

    const refetch = fetchedLayout && fetchedLayout.id !== layout.id;
    if (canvasInitialized.elementsFetchInitialized && !refetch) return;

    // Fetch ElementData
    if (!refetch) {
      const datas = ElementData.all();
      dispatch(initData(datas));
    }

    // Fetch Elements
    const elements = Array.from(Elements.filterByLayoutId(layout!.id));

    const offsetElements: Elements[] = !isOverlay
      ? elementOffsetForCanvas(elements)
      : elementOffsetForOverlay(elements);

    dispatch(initElements(offsetElements));

    const canvasElements: CanvasElementType[] = [];

    offsetElements.forEach((element: Elements) => {
      if (canvasElements.filter((e: CanvasElementType) => e.Elements.id === element.id).length > 0) return;

      canvasElements.push(CreateElementComponent(element));
    });

    dispatch(initCanvasElements(canvasElements));

    setFetchedLayout(layout);
    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, elementsFetchInitialized: true }));
  }, [layout, canvasInitialized.elementsFetchInitialized, isOverlay, fetchedLayout, setCanvasInitialized, dispatch]);
};

const elementOffsetForCanvas = (elements: Elements[]) => {
  const newElementArray: Elements[] = [];

  elements.forEach((element: Elements) => {
    newElementArray.push(OffsetElementForCanvas(element));
  });

  return newElementArray;
};

const elementOffsetForOverlay = (elements: Elements[]) => {
  const newElementArray: Elements[] = [];

  elements.forEach((element: Elements) => {
    newElementArray.push(element);
  });

  return newElementArray;
};

export default useFetchElement;
