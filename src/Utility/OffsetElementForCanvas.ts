import ElementStruct from "../module_bindings/element_struct";
import Elements from "../module_bindings/elements";
import ImageElement from "../module_bindings/image_element";
import ImageElementData from "../module_bindings/image_element_data";
import TextElement from "../module_bindings/text_element";
import WidgetElement from "../module_bindings/widget_element";
import {
  GetCoordsFromTransform,
  GetTransformFromCoords,
  StdbToViewportCoords,
  StdbToViewportFontSize,
  StdbToViewportSize,
} from "./ConvertCoordinates";
import { DebugLogger } from "./DebugLogger";

export const OffsetElementForCanvas = (element: Elements) => {
  DebugLogger("Offsetting element for canvas");

  // This disgusting mess below is to "deep copy" the Element, so we don't accidentally mutate the StDB cache'd Element
  let newElementStruct: ElementStruct;

  switch (element.element.tag) {
    case "TextElement":
      newElementStruct = ElementStruct.TextElement({
        text: element.element.value.text,
        size: element.element.value.size,
        color: element.element.value.color,
        font: element.element.value.font,
      });
      break;
    case "ImageElement":
      let eData: ImageElementData;
      switch (element.element.value.imageElementData.tag) {
        case "ElementDataId":
          eData = ImageElementData.ElementDataId(element.element.value.imageElementData.value);
          break;
        case "RawData":
          eData = ImageElementData.RawData(element.element.value.imageElementData.value);
          break;
      }
      newElementStruct = ElementStruct.ImageElement({
        imageElementData: eData,
        width: element.element.value.width,
        height: element.element.value.height,
      });
      break;
    case "WidgetElement":
      newElementStruct = ElementStruct.WidgetElement({
        elementDataId: element.element.value.elementDataId,
        width: element.element.value.width,
        height: element.element.value.height,
        rawData: element.element.value.rawData,
      });
      break;
  }

  const newElement: Elements = {
    id: element.id,
    element: newElementStruct,
    transparency: element.transparency,
    transform: element.transform,
    clip: element.clip,
    locked: element.locked,
    layoutId: element.layoutId,
    placedBy: element.placedBy,
    lastEditedBy: element.lastEditedBy,
    zIndex: element.zIndex,
  };

  const transformCoords = GetCoordsFromTransform(newElement.transform);

  const coords = StdbToViewportCoords(transformCoords.x, transformCoords.y);

  newElement.transform = GetTransformFromCoords(
    coords.x,
    coords.y,
    transformCoords.rotation,
    transformCoords.scaleX,
    transformCoords.scaleY
  );

  switch (newElement.element.tag) {
    case "TextElement":
      const textElement: TextElement = newElement.element.value as TextElement;
      const fontSize = StdbToViewportFontSize(textElement.size).fontSize;

      newElement.element = ElementStruct.TextElement({
        text: textElement.text,
        size: fontSize,
        color: textElement.color,
        font: textElement.font,
      });
      break;

    case "ImageElement":
      const imageElement: ImageElement = newElement.element.value as ImageElement;
      const imageSize = StdbToViewportSize(imageElement.width, imageElement.height);

      newElement.element = ElementStruct.ImageElement({
        imageElementData: imageElement.imageElementData,
        width: imageSize.width,
        height: imageSize.height,
      });
      break;

    case "WidgetElement":
      const widgetElement: WidgetElement = newElement.element.value as WidgetElement;
      const widgetSize = StdbToViewportSize(widgetElement.width, widgetElement.height);

      newElement.element = ElementStruct.WidgetElement({
        elementDataId: widgetElement.elementDataId,
        width: widgetSize.width,
        height: widgetSize.height,
        rawData: widgetElement.rawData,
      });
      break;
  }

  return newElement;
};
