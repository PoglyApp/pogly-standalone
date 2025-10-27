import { ElementData, Elements, Guests, Layouts } from "../module_bindings";
import { DebugLogger } from "./DebugLogger";

export const HandleElementContextMenu = (event: any, setContextMenu: Function, contextMenu: any, element: Elements) => {
  DebugLogger("Handling element context menu");
  event.preventDefault();

  setContextMenu(
    contextMenu === null
      ? {
          element: element,
          mouseX: event.clientX - 3,
          mouseY: event.clientY - 2,
        }
      : null
  );
};

export const HandleElementSelectionContextMenu = (
  event: any,
  setContextMenu: Function,
  contextMenu: any,
  elementData: ElementData
) => {
  DebugLogger("Handling element selection context menu");
  event.preventDefault();

  setContextMenu(
    contextMenu === null
      ? {
          elementData: elementData,
          mouseX: event.clientX - 3,
          mouseY: event.clientY - 2,
        }
      : null
  );
};

export const HandleLayoutSelectionContextMenu = (
  event: any,
  setContextMenu: Function,
  contextMenu: any,
  layout: Layouts
) => {
  DebugLogger("Handling layout selection context menu");
  event.preventDefault();

  setContextMenu(
    contextMenu === null
      ? {
          layout: layout,
          mouseX: event.clientX - 3,
          mouseY: event.clientY - 2,
        }
      : null
  );
};

export const HandleGuestListContextMenu = (event: any, setContextMenu: Function, contextMenu: any, guest: Guests) => {
  event.preventDefault();

  setContextMenu(
    contextMenu === null
      ? {
          guest: guest,
          mouseX: event.clientX - 3,
          mouseY: event.clientY - 2,
        }
      : null
  );
};

export const HandleQuickSwapContextMenu = (event: any, setContextMenu: Function, contextMenu: any, module: string) => {
  DebugLogger("Handling quick swap context menu");
  event.preventDefault();

  setContextMenu(
    contextMenu === null
      ? {
          module: module,
          mouseX: event.clientX - 3,
          mouseY: event.clientY - 2,
        }
      : null
  );
};
