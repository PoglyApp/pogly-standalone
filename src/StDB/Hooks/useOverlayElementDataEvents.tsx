import { useContext, useEffect } from "react";
import { addElementData, removeElementData, updateElementData } from "../../Store/Features/ElementDataSlice";
import { useAppDispatch } from "../../Store/Features/store";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { WidgetCodeCompiler } from "../../Utility/WidgetCodeCompiler";
import { DebugLogger } from "../../Utility/DebugLogger";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ElementData, EventContext } from "../../module_bindings";

export const useOverlayElementDataEvents = (
  canvasInitialized: CanvasInitializedType,
  setCanvasInitialized: Function
) => {
  const dispatch = useAppDispatch();
  const { spacetimeDB } = useContext(SpacetimeContext);

  useEffect(() => {
    DebugLogger("Initializing overlay element data events");

    spacetimeDB.Client.db.elementData.onInsert((ctx: EventContext, element: ElementData) => {
      if (!ctx.event) return;

      dispatch(addElementData(element));
    });

    spacetimeDB.Client.db.elementData.onUpdate((ctx: EventContext, oldData: ElementData, newData: ElementData) => {
      // UPDATE DATA
      if (oldData.data !== newData.data) {
        const widgetsWithData = document.querySelectorAll(`[data-widget-element-data-id='${oldData.id.toString()}']`);

        const htmlTag = WidgetCodeCompiler(spacetimeDB.Client, undefined, undefined, undefined, newData.data);

        widgetsWithData.forEach((widget: any) => {
          widget.src = "data:text/html;charset=utf-8," + encodeURIComponent(htmlTag);
        });
      }

      dispatch(updateElementData(newData));
    });

    spacetimeDB.Client.db.elementData.onDelete((ctx: EventContext, element: ElementData) => {
      if (!ctx.event) return;

      dispatch(removeElementData(element));
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, overlayElementDataEventsInitialized: true }));
  }, [setCanvasInitialized, dispatch, spacetimeDB.Client]);
};
