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
import { DebugLogger } from "../../Utility/DebugLogger";

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

    DebugLogger("Fetching elements");

    const refetch = fetchedLayout && fetchedLayout.id !== layout.id;
    if (canvasInitialized.elementsFetchInitialized && !refetch) return;

    // Fetch ElementData
    if (!refetch) {
      DebugLogger("Fetching element data");
      const datas = ElementData.all();
      dispatch(initData(datas));
    }

    // Fetch Elements
    const fetchedElements = Array.from(Elements.filterByLayoutId(layout.id));

    // This is here to fix a weird bug with SpacetimeDB Typescript SDK that only happens with Firefox where the SpacetimeDB cache doesn't update properly
    // When Clockwork Labs gets around to fix the issue, you can remove this and change line 38 back to "fetchedElements" -> "elements"
    const elements = removeDuplicatesKeepLast(fetchedElements);

    const offsetElements: Elements[] = !isOverlay
      ? elementOffsetForCanvas(elements)
      : elementOffsetForOverlay(elements);

    dispatch(initElements(offsetElements));

    const canvasElements: CanvasElementType[] = [];

    offsetElements.forEach((element: Elements) => {
      canvasElements.push(CreateElementComponent(element, isOverlay));
    });

    dispatch(initCanvasElements(canvasElements));

    setFetchedLayout(layout);
    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, elementsFetchInitialized: true }));
  }, [layout, canvasInitialized.elementsFetchInitialized, isOverlay, fetchedLayout, setCanvasInitialized, dispatch]);
};

const elementOffsetForCanvas = (elements: Elements[]) => {
  const newElementArray: Elements[] = [];

  DebugLogger("Offsetting elements for canvas");

  elements.forEach((element: Elements) => {
    newElementArray.push(OffsetElementForCanvas(element));
  });

  return newElementArray;
};

const elementOffsetForOverlay = (elements: Elements[]) => {
  const newElementArray: Elements[] = [];

  DebugLogger("Offsetting elements for overlay");

  elements.forEach((element: Elements) => {
    newElementArray.push(element);
  });

  return newElementArray;
};

function removeDuplicatesKeepLast(arr: Elements[]): Elements[] {
  const seen = new Set<number>();
  DebugLogger("Removing duplicate elements");

  for (let i = arr.length - 1; i >= 0; i--) {
    if (seen.has(arr[i].id)) {
      arr.splice(i, 1);
    } else {
      seen.add(arr[i].id);
    }
  }

  return arr;
}

export default useFetchElement;
