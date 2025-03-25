import { useEffect } from "react";
import { addElementData, removeElementData, updateElementData } from "../../Store/Features/ElementDataSlice";
import { useAppDispatch } from "../../Store/Features/store";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { WidgetCodeCompiler } from "../../Utility/WidgetCodeCompiler";
import { DebugLogger } from "../../Utility/DebugLogger";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ElementData, EventContext } from "../../module_bindings";

export const useElementDataEvents = (canvasInitialized: CanvasInitializedType, setCanvasInitialized: Function) => {
  const dispatch = useAppDispatch();
  const { Client } = useSpacetimeContext();

  useEffect(() => {
    if (canvasInitialized.elementDataEventsInitialized) return;

    DebugLogger("Initializing element data events");

    Client.db.elementData.onInsert((ctx: EventContext, element: ElementData) => {
      if (!ctx.event) return;

      const imageSkeleton = document.getElementById("imageSkeleton");
      if (imageSkeleton) imageSkeleton.style.display = "none";

      dispatch(addElementData(element));
    });

    Client.db.elementData.onUpdate((ctx: EventContext, oldData: ElementData, newData: ElementData) => {
      // UPDATE WIDGET NAME
      if (oldData.name !== newData.name) {
        const widgetButton = document.querySelectorAll(`[data-widget-selection-button='${oldData.id.toString()}']`)[0];

        widgetButton.innerHTML = newData.name;
      }

      // UPDATE DATA
      if (oldData.data !== newData.data) {
        const widgetsWithData = document.querySelectorAll(`[data-widget-element-data-id='${oldData.id.toString()}']`);

        const htmlTag = WidgetCodeCompiler(Client, undefined, undefined, undefined, newData.data);

        widgetsWithData.forEach((widget: any) => {
          widget.src = "data:text/html;charset=utf-8," + encodeURIComponent(htmlTag);
        });
      }

      dispatch(updateElementData(newData));
    });

    Client.db.elementData.onDelete((ctx: EventContext, element: ElementData) => {
      if (!ctx.event) return;
      
      dispatch(removeElementData(element));
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, elementDataEventsInitialized: true }));
  }, [canvasInitialized.elementDataEventsInitialized, setCanvasInitialized, dispatch, Client]);
};
