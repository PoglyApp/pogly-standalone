import { useContext, useEffect } from "react";
import Elements from "../../module_bindings/elements";
import ElementData from "../../module_bindings/element_data";
import { initData } from "../../Store/Features/ElementDataSlice";
import { initElements } from "../../Store/Features/ElementsSlice";
import { useAppDispatch } from "../../Store/Features/store";
import { OffsetElementForCanvas } from "../../Utility/OffsetElementForCanvas";
import Config from "../../module_bindings/config";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { ConfigContext } from "../../Contexts/ConfigContext";
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

  useEffect(() => {
    if (canvasInitialized.elementsFetchInitialized || !layout) return;

    // Fetch ElementData
    const datas = ElementData.all();
    dispatch(initData(datas));

    // Fetch Elements
    const elements = Array.from(Elements.filterByLayoutId(layout.id));

    const offsetElements: Elements[] = !isOverlay
      ? elementOffsetForCanvas(elements)
      : elementOffsetForOverlay(elements);

    dispatch(initElements(offsetElements));

    const canvasElements: CanvasElementType[] = [];

    offsetElements.forEach((element: Elements) => {
      canvasElements.push(CreateElementComponent(element));
    });

    dispatch(initCanvasElements(canvasElements));

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, elementsFetchInitialized: true }));
  }, [layout, canvasInitialized.elementsFetchInitialized, isOverlay, setCanvasInitialized, dispatch]);
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
