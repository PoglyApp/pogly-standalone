import { useEffect, useState } from "react";
import { CanvasElementType } from "../../Types/General/CanvasElementType";
import { CreateElementComponent } from "../../Utility/CreateElementComponent";
import { WidgetCodeCompiler } from "../../Utility/WidgetCodeCompiler";
import { ApplyCustomFont } from "../../Utility/ApplyCustomFont";
import { DebugLogger } from "../../Utility/DebugLogger";
import { InRenderBounds } from "../../Utility/ConvertCoordinates";
import { parseCustomCss, removedCssProperties } from "../../Utility/ParseCustomCss";
import { marked } from "marked";
import {
  DbConnection,
  Elements,
  EventContext,
  ImageElement,
  ImageElementData,
  Layouts,
  TextElement,
  WidgetElement,
} from "../../module_bindings";
import { getActiveLayout } from "../SpacetimeDBUtils";

export const useOverlayElementsEvents = (setElements: Function, spacetimeDB: DbConnection | undefined) => {
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (initialized || !spacetimeDB) return;

    DebugLogger("Initializing overlay element events");

    spacetimeDB.db.elements.onInsert((ctx: EventContext, element: Elements) => {
      if (!ctx.event) return;

      const activeLayout: Layouts = getActiveLayout(spacetimeDB);
      if (element.layoutId !== activeLayout.id) return;

      const newElement: CanvasElementType | undefined = CreateElementComponent(element);

      setElements((elements: CanvasElementType[]) => [...elements, newElement]);
    });

    spacetimeDB.db.elements.onUpdate(async (ctx: EventContext, oldElement: Elements, newElement: Elements) => {
      if (!ctx.event) return;

      const activeLayout: Layouts = getActiveLayout(spacetimeDB);
      if (newElement.layoutId !== activeLayout.id) return;

      const component = document.getElementById(oldElement.id.toString());

      // LAYOUT ID CHANGE (Layout has been deleted and is being preserved)
      if (oldElement.layoutId !== newElement.layoutId) {
        if (component) return;

        const newCanvasElement: CanvasElementType | undefined = CreateElementComponent(newElement);

        setElements((elements: CanvasElementType[]) => [...elements, newCanvasElement]);
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
            const newCss = JSON.parse(newTextElement.css);
            const newCustomCss = parseCustomCss(newCss.custom);

            const oldCss = JSON.parse(oldTextElement.css);
            const oldCustomCss = parseCustomCss(oldCss.custom);

            component.style.textShadow = newCss.shadow;
            component.style.webkitTextStroke = newCss.outline;

            Object.keys(newCustomCss).forEach((styleKey: any) => {
              component.style[styleKey] = newCustomCss[styleKey];
            });

            const removedProperties = removedCssProperties(oldCustomCss, newCustomCss);

            if (!removedProperties) return;

            removedProperties.forEach((property: any) => {
              component.style[property] = "";
            });
          }
          break;

        case "ImageElement":
          const oldImageElement: ImageElement = oldElement.element.value as ImageElement;
          const newImageElement: ImageElement = newElement.element.value as ImageElement;

          const oldImageData: ImageElementData = oldImageElement.imageElementData;
          const newImageData: ImageElementData = newImageElement.imageElementData;

          if (oldImageData.value !== newImageData.value) {
            component.children[0].setAttribute("src", newImageData.value.toString());
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
            const htmlTag = WidgetCodeCompiler(
              spacetimeDB,
              newWidgetElement.width,
              newWidgetElement.height,
              undefined,
              newWidgetElement.rawData
            );

            component.children[0].setAttribute("srcDoc", htmlTag);
          }
          break;
      }

      // UPDATE TRANSFORM
      if (oldElement.transform !== newElement.transform) {
        if (InRenderBounds(newElement)) {
          component.style.setProperty("display", "block");
          component.style.setProperty("transform", newElement.transform);
        } else {
          component.style.setProperty("display", "none");
        }
      }

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
          component.style.setProperty("clip-path", newElement.clip);
        }
      }
    });

    spacetimeDB.db.elements.onDelete((ctx: EventContext, element: Elements) => {
      if (!ctx.event) return;

      const activeLayout: Layouts = getActiveLayout(spacetimeDB);
      if (element.layoutId !== activeLayout.id) return;

      setElements((elements: CanvasElementType[]) => {
        const filteredElements = elements.filter((e: CanvasElementType) => e.Elements.id !== element.id);

        return filteredElements;
      });
    });

    setInitialized(true);
  }, [spacetimeDB]);
};
