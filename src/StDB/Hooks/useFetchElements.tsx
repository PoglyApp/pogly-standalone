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

const useFetchElement = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const dispatch = useAppDispatch();
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const config = useContext(ConfigContext);

  useEffect(() => {
    if (canvasInitialized.elementsFetchInitialized) return;

    // Fetch ElementData
    const datas = ElementData.all();
    dispatch(initData(datas));

    // Fetch Elements
    const elements = Elements.all();

    const offsetElements: Elements[] = !isOverlay
      ? elementOffsetForCanvas(elements)
      : elementOffsetForOverlay(elements, config);

    dispatch(initElements(offsetElements));

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, elementsFetchInitialized: true }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const elementOffsetForCanvas = (elements: Elements[]) => {
  const newElementArray: Elements[] = [];

  elements.forEach((element: Elements) => {
    newElementArray.push(OffsetElementForCanvas(element));
  });

  return newElementArray;
};

const elementOffsetForOverlay = (elements: Elements[], config: Config) => {
  const newElementArray: Elements[] = [];

  elements.forEach((element: Elements) => {
    newElementArray.push(element);
  });

  return newElementArray;
};

export default useFetchElement;
