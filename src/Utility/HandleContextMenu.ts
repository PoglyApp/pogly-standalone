import Elements from "../module_bindings/elements";
import ElementData from "../module_bindings/element_data";
import Guests from "../module_bindings/guests";
import Layouts from "../module_bindings/layouts";

export const HandleElementContextMenu = (event: any, setContextMenu: Function, contextMenu: any, element: Elements) => {
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
