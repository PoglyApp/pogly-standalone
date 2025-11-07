import { Elements, Layouts } from "@/module_bindings";
import { useEffect } from "react";
import { getActiveLayout, getLayoutByName } from "../SpacetimeDBUtils";
import { OffsetElementForCanvas } from "@/Utility/OffsetElementForCanvas";
import { CreateElementComponent } from "@/Utility/CreateElementComponent";

export const useFetchElements = (spacetimeDB: any, setElements: Function, setElementComponents: Function) => {
  const urlParams = new URLSearchParams(window.location.search);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const layoutParam = urlParams.get("layout");

  useEffect(() => {
    if (!spacetimeDB || !spacetimeDB.Subscriptions) return;

    const activeLayout: Layouts | undefined = layoutParam
      ? getLayoutByName(spacetimeDB.Client, layoutParam)
      : getActiveLayout(spacetimeDB.Client);

    if (!activeLayout) return;

    const elements: Elements[] = (spacetimeDB.Client.db.elements.iter() as Elements[]).filter(
      (element: Elements) => element.layoutId === activeLayout.id
    );

    const offsetElements = isOverlay ? elements : elementOffsetForCanvas(elements);
    const canvasElements: JSX.Element[] = [];

    console.log(elements);

    offsetElements.forEach((element: Elements) => {
      canvasElements.push(CreateElementComponent(element));
    });

    setElements(elements);
    setElementComponents(canvasElements);
  }, [spacetimeDB]);
};

const elementOffsetForCanvas = (elements: Elements[]) => {
  const newElementArray: Elements[] = [];

  elements.forEach((element: Elements) => {
    newElementArray.push(OffsetElementForCanvas(element));
  });

  return newElementArray;
};
