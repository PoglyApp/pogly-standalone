import { useEffect } from "react";
import { OffsetElementForCanvas } from "../../Utility/OffsetElementForCanvas";
import { DebugLogger } from "../../Utility/DebugLogger";
import { DbConnection, Elements, Layouts } from "../../module_bindings";
import { CanvasElementType } from "../../Types/General/CanvasElementType";
import { CreateElementComponent } from "../../Utility/CreateElementComponent";

const useFetchElement = (
  Client: DbConnection | undefined,
  subscriptionsApplied: boolean,
  setElements: Function,
  refetchElements: boolean,
  setRefetchElements: Function
) => {
  const urlParams = new URLSearchParams(window.location.search);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const layoutParam = urlParams.get("layout");

  useEffect(() => {
    if (!Client || !subscriptionsApplied || !refetchElements) return;

    const activeLayout: Layouts = layoutParam ? getLayoutByName(Client, layoutParam)! : getLayoutByActivity(Client)!;

    if (!activeLayout) return;

    const elements: Elements[] = (Client.db.elements.iter() as Elements[]).filter(
      (element: Elements) => element.layoutId === activeLayout.id
    );

    const offsetElements = isOverlay ? elementOffsetForOverlay(elements) : elementOffsetForCanvas(elements);
    const canvasElements: CanvasElementType[] = [];

    offsetElements.forEach((element: Elements) => {
      canvasElements.push(CreateElementComponent(element));
    });

    setElements(canvasElements);

    if (refetchElements) setRefetchElements(false);
  }, [subscriptionsApplied, refetchElements]);
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

const removeDuplicateKeepLast = (arr: Elements[]) => {
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
};

const getLayoutByActivity = (Client: DbConnection) => {
  return (Client.db.layouts.iter() as Layouts[]).find((Layout: Layouts) => Layout.active === true);
};

const getLayoutByName = (Client: DbConnection, name: string) => {
  return (Client.db.layouts.iter() as Layouts[]).find((Layout: Layouts) => Layout.name === name);
};

export default useFetchElement;
