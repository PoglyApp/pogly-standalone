import { useEffect, useRef } from "react";
import Elements from "../../module_bindings/elements";
import { useAppDispatch } from "../../Store/Features/store";
import { addElement, removeElement } from "../../Store/Features/ElementsSlice";
import { addCanvasElement, removeCanvasElement } from "../../Store/Features/CanvasElementSlice";
import { CanvasElementType } from "../../Types/General/CanvasElementType";
import { CreateElementComponent } from "../../Utility/CreateElementComponent";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import TextElement from "../../module_bindings/text_element";
import WidgetElement from "../../module_bindings/widget_element";
import { WidgetCodeCompiler } from "../../Utility/WidgetCodeCompiler";
import Layouts from "../../module_bindings/layouts";
import { ApplyCustomFont } from "../../Utility/ApplyCustomFont";

export const useOverlayElementsEvents = (
  layout: Layouts,
  canvasInitialized: CanvasInitializedType,
  setCanvasInitialized: Function
) => {
  const dispatch = useAppDispatch();

  const activeLayout = useRef<Layouts>();

  useEffect(() => {
    activeLayout.current = layout;
  }, [layout]);

  useEffect(() => {
    if (canvasInitialized.overlayElementEventsInitialized || !layout) return;

    Elements.onInsert((element, reducerEvent) => {
      if (reducerEvent && reducerEvent.reducerName !== "AddElementToLayout") return;
      if (element.layoutId !== activeLayout.current!.id) return;

      const newElement: CanvasElementType | undefined = CreateElementComponent(element);

      dispatch(addElement(newElement.Elements));
      dispatch(addCanvasElement(newElement));
    });

    Elements.onUpdate((oldElement, newElement) => {
      if (newElement.layoutId !== activeLayout.current!.id) return;

      const component = document.getElementById(oldElement.id.toString());

      // LAYOUT ID CHANGE (Layout has been deleted and is being preserved)
      if (oldElement.layoutId !== newElement.layoutId) {
        if (component) return;

        const newCanvasElement: CanvasElementType | undefined = CreateElementComponent(newElement);

        dispatch(addElement(newCanvasElement.Elements));
        dispatch(addCanvasElement(newCanvasElement));
      }

      if (!component) return;

      // UPDATE LOCKED
      if (oldElement.locked !== newElement.locked) {
        component.setAttribute("data-locked", newElement.locked ? "true" : "false");
      }

      // UPDATE ZINDEX
      if (oldElement.zIndex !== newElement.zIndex) {
        component.style.setProperty("z-index", newElement.zIndex.toString());
      }

      // UPDATE TRANSPARENCY
      if (oldElement.transparency !== newElement.transparency) {
        component.style.setProperty("opacity", (newElement.transparency / 100).toString());
      }

      // ======================================================================

      // ===== ELEMENT SPECIFIC =====

      switch (newElement.element.tag) {
        case "TextElement":
          const oldTextElement: TextElement = oldElement.element.value as TextElement;
          const newTextElement: TextElement = newElement.element.value as TextElement;

          // UPDATE TEXT
          if (oldTextElement.text !== newTextElement.text) {
            component.innerHTML = newTextElement.text;
          }

          // UPDATE SIZE
          if (oldTextElement.size !== newTextElement.size) {
            component.style.fontSize = `${newTextElement.size}px`;
          }

          // UPDATE COLOR
          if (oldTextElement.color !== newTextElement.color) {
            component.style.color = newTextElement.color;
          }

          // UPDATE FONT
          if (oldTextElement.font !== newTextElement.font) {
            try {
              const fontJSON = JSON.parse(newTextElement.font);
              ApplyCustomFont(fontJSON, component);
            } catch (error) {
              component.style.fontFamily = newTextElement.font;
            }
          }
          break;

        case "WidgetElement":
          const oldWidgetElement: WidgetElement = oldElement.element.value as WidgetElement;
          const newWidgetElement: WidgetElement = newElement.element.value as WidgetElement;

          // UPDATE WIDTH
          if (oldWidgetElement.width !== newWidgetElement.width) {
            component.style.width = newWidgetElement.width.toString();
          }

          // UPDATE HEIGHT
          if (oldWidgetElement.height !== newWidgetElement.height) {
            component.style.height = newWidgetElement.height.toString();
          }

          // UPDATE RAW DATA
          if (oldWidgetElement.rawData !== newWidgetElement.rawData) {
            const htmlTag = WidgetCodeCompiler(undefined, newWidgetElement.rawData);

            component.children[0].setAttribute("src", "data:text/html;charset=utf-8," + encodeURIComponent(htmlTag));
          }
          break;
      }

      // UPDATE TRANSFORM
      if (oldElement.transform !== newElement.transform) {
        component.style.setProperty("transform", newElement.transform);
      }

      // UPDATE RESIZE
      if (newElement.element.tag === "ImageElement" || newElement.element.tag === "WidgetElement") {
        const oldImageElement: any = oldElement.element.value;
        const newImageElement: any = newElement.element.value;

        if (oldImageElement.height !== newImageElement.height || oldImageElement.width !== newImageElement.width) {
          component.style.width = newImageElement.width + "px";
          component.style.height = newImageElement.height + "px";
        }

        // UPDATE CLIP
        if (oldElement.clip !== newElement.clip) {
          component.style.clipPath = newElement.clip;
          component.style.setProperty("transform", newElement.transform);
        }
      }
    });

    Elements.onDelete((element, reducerEvent) => {
      if (!reducerEvent) return;
      if (element.layoutId !== activeLayout.current!.id) return;

      dispatch(removeCanvasElement(element));
      dispatch(removeElement(element));
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, overlayElementEventsInitialized: true }));
  }, [layout, canvasInitialized.overlayElementEventsInitialized, setCanvasInitialized, dispatch]);
};
