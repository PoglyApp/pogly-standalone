import Elements from "../module_bindings/elements";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { Text } from "../Components/Elements/Text";
import { Image } from "../Components/Elements/Image";
import { Widget } from "../Components/Elements/Widget";
import { OffsetElementForCanvas } from "./OffsetElementForCanvas";
import { DebugLogger } from "./DebugLogger";

export const CreateOffsetElementComponent = (elements: Elements) => {
  DebugLogger("Creating offset element component");
  const newElement: Elements = OffsetElementForCanvas(elements);

  const canvasElement: CanvasElementType = {
    Elements: newElement,
    ElementData: undefined,
    Component: undefined,
  };

  switch (elements.element.tag) {
    case "TextElement":
      canvasElement.Component = <Text elements={newElement} />;
      break;

    case "ImageElement":
      canvasElement.Component = <Image elements={newElement} />;
      break;

    case "WidgetElement":
      canvasElement.Component = <Widget elements={newElement} />;

      break;
  }

  return canvasElement;
};

export const CreateElementComponent = (elements: Elements, isOverlay: Boolean) => {
  DebugLogger("Creating element component");
  const newElement: Elements = {
    id: elements.id,
    element: { ...elements.element },
    transparency: elements.transparency,
    transform: elements.transform,
    clip: elements.clip,
    locked: elements.locked,
    layoutId: elements.layoutId,
    folderId: elements.folderId,
    placedBy: elements.placedBy,
    lastEditedBy: elements.lastEditedBy,
    zIndex: elements.zIndex,
  };

  const canvasElement: CanvasElementType = {
    Elements: newElement,
    ElementData: undefined,
    Component: undefined,
  };

  switch (elements.element.tag) {
    case "TextElement":
      canvasElement.Component = <Text elements={newElement} />;
      break;

    case "ImageElement":
      canvasElement.Component = <Image elements={newElement} />;
      break;

    case "WidgetElement":
      canvasElement.Component = <Widget elements={newElement} />;

      break;
  }
  
  return canvasElement;
};
