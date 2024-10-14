import { useEffect, useRef, useState } from "react";
import Elements from "../../module_bindings/elements";
import { useAppDispatch, useAppSelector } from "../../Store/Features/store";
import { CreateOffsetElementComponent } from "../../Utility/CreateElementComponent";
import { addElement, removeElement } from "../../Store/Features/ElementsSlice";
import { addCanvasElement, removeCanvasElement } from "../../Store/Features/CanvasElementSlice";
import ElementData from "../../module_bindings/element_data";
import { CanvasElementType } from "../../Types/General/CanvasElementType";
import { OffsetElementForCanvas } from "../../Utility/OffsetElementForCanvas";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import TextElement from "../../module_bindings/text_element";
import WidgetElement from "../../module_bindings/widget_element";
import Selecto from "react-selecto";
import { WidgetCodeCompiler } from "../../Utility/WidgetCodeCompiler";
import Layouts from "../../module_bindings/layouts";
import { ApplyCustomFont } from "../../Utility/ApplyCustomFont";
import { SelectedType } from "../../Types/General/SelectedType";
import { DebugLogger } from "../../Utility/DebugLogger";
import { marked } from "marked";
import { parseCustomCss } from "../../Utility/ParseCustomCss";

export const useElementsEvents = (
  selectoRef: React.RefObject<Selecto>,
  selected: SelectedType | undefined,
  setSelected: Function,
  setSelectoTargets: Function,
  canvasInitialized: CanvasInitializedType,
  setCanvasInitialized: Function,
  layout: Layouts | undefined
) => {
  const { Identity } = useSpacetimeContext();

  const dispatch = useAppDispatch();

  const elementData = useRef<ElementData[]>([]);
  const activeLayout = useRef<Layouts>();
  const selectedElement = useRef<SelectedType | undefined>();

  const elementDataStore = useAppSelector((state: any) => state.elementData.elementData);

  useEffect(() => {
    DebugLogger("Updating element event refs");
    elementData.current = elementDataStore;
    activeLayout.current = layout;
    selectedElement.current = selected;
  }, [elementDataStore, layout, selected]);

  useEffect(() => {
    if (canvasInitialized.elementEventsInitialized || !layout) return;

    DebugLogger("Initializing element events");

    Elements.onInsert((element, reducerEvent) => {
      if (!activeLayout.current) return;
      if (reducerEvent && reducerEvent.reducerName !== "AddElementToLayout") return;
      if (element.layoutId !== activeLayout.current.id) return;

      const newElement: CanvasElementType | undefined = CreateOffsetElementComponent(element);

      dispatch(addElement(newElement.Elements));
      dispatch(addCanvasElement(newElement));
    });

    Elements.onUpdate(async (oldElement, newElement, reducerEvent) => {
      if (!activeLayout.current) return;
      if (newElement.layoutId !== activeLayout.current.id) return;

      const component = document.getElementById(oldElement.id.toString());

      // LAYOUT ID CHANGE (Layout has been deleted and is being preserved)
      if (oldElement.layoutId !== newElement.layoutId) {
        if (component) return;

        const newCanvasElement: CanvasElementType | undefined = CreateOffsetElementComponent(newElement);

        dispatch(addElement(newCanvasElement.Elements));
        dispatch(addCanvasElement(newCanvasElement));
      }

      if (!component) return;

      // ===== GENERAL =====

      // UPDATE LOCKED
      if (oldElement.locked !== newElement.locked) {
        component.setAttribute("data-locked", newElement.locked ? "true" : "false");
        if (newElement.locked && selectoRef.current) {
          setSelectoTargets(
            selectoRef.current
              .getSelectedTargets()
              .filter((e) => e.id !== component.id && e.getAttribute("data-locked") === "false")
          );
        }
      }

      // UPDATE ZINDEX
      if (oldElement.zIndex !== newElement.zIndex) {
        component.style.setProperty("z-index", newElement.zIndex.toString());
      }

      // UPDATE TRANSPARENCY
      if (oldElement.transparency !== newElement.transparency) {
        const transparency = newElement.transparency / 100 <= 0.2 ? 0.2 : newElement.transparency / 100;

        if (transparency === 0.2) {
          component.style.setProperty("background-color", "rgba(245, 39, 39, 0.8)");
        } else {
          component.style.setProperty("background-color", "");
        }

        component.style.setProperty("opacity", transparency.toString());
      }

      // ======================================================================

      // ===== ELEMENT SPECIFIC =====

      switch (newElement.element.tag) {
        case "TextElement":
          const oldTextElement: TextElement = oldElement.element.value as TextElement;
          const newTextElement: TextElement = newElement.element.value as TextElement;

          // UPDATE TEXT
          if (oldTextElement.text !== newTextElement.text) {
            const markdownToHtml = await marked.parse(newTextElement.text);
            component.innerHTML = markdownToHtml;
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

          // UPDATE CSS
          if (oldTextElement.css !== newTextElement.css) {
            const css = JSON.parse(newTextElement.css);
            const customCss = parseCustomCss(css.custom);

            component.style.textShadow = css.shadow;
            component.style.webkitTextStroke = css.outline;

            Object.keys(customCss).forEach((styleKey: any) => {
              component.style[styleKey] = customCss[styleKey];
            });
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

            component.children[0].setAttribute("srcDoc", htmlTag);
          }
          break;
      }

      // ======================================================================

      // ===== MOVEABLE OBJECT RELATED =====
      if (reducerEvent?.callerAddress?.toHexString() === Identity.address.toHexString() || !component) return;

      const offsetElement = OffsetElementForCanvas(newElement);
      component.style.setProperty("transform", offsetElement.transform);

      // UPDATE RESIZE
      if (newElement.element.tag === "ImageElement" || newElement.element.tag === "WidgetElement") {
        const oldImageElement: any = oldElement.element.value;
        const newImageElement: any = newElement.element.value;

        if (oldImageElement.height !== newImageElement.height || oldImageElement.width !== newImageElement.width) {
          component.style.width = newImageElement.width + "px";
          component.style.height = newImageElement.height + "px";
        }
      }

      // UPDATE CLIP
      if (oldElement.clip !== newElement.clip) {
        component.style.clipPath = newElement.clip;
        component.style.setProperty("transform", newElement.transform);
      }
    });

    Elements.onDelete((element, reducerEvent) => {
      if (!reducerEvent) return;
      if (!activeLayout.current) return;
      if (element.layoutId !== activeLayout.current.id) return;

      if (selectedElement.current && selectedElement.current.Elements.id === element.id) setSelected(null);

      dispatch(removeCanvasElement(element));
      dispatch(removeElement(element));
    });

    setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, elementEventsInitialized: true }));
  }, [
    canvasInitialized.elementEventsInitialized,
    Identity.identity,
    Identity.address,
    selectoRef,
    setCanvasInitialized,
    setSelected,
    setSelectoTargets,
    layout,
    dispatch,
  ]);
};
