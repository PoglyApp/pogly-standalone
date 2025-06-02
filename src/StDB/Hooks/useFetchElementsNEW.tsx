import { useEffect } from "react";
import { OffsetElementForCanvas } from "../../Utility/OffsetElementForCanvas";
import { DebugLogger } from "../../Utility/DebugLogger";
import { DbConnection, ElementData, Elements, Layouts } from "../../module_bindings";

const useFetchElement = (
  Client: DbConnection | undefined,
  subscriptionsApplied: boolean,
  setElements: Function,
  setElementData: Function
) => {
  const urlParams = new URLSearchParams(window.location.search);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const layoutParam = urlParams.get("layout");

  useEffect(() => {
    if (!Client || !subscriptionsApplied) return;

    const activeLayout: Layouts = layoutParam ? getLayoutByName(Client, layoutParam)! : getLayoutByActivity(Client)!;

    if (!activeLayout) return;

    const elements: Elements[] = (Client.db.elements.iter() as Elements[]).filter(
      (element: Elements) => element.layoutId === activeLayout.id
    );
    const elementData: ElementData[] = Client.db.elementData.iter() as ElementData[];

    setElements(elements);
    setElementData(elementData);
  }, [subscriptionsApplied]);
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
