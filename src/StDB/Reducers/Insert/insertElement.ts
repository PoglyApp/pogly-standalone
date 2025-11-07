import {
  DataType,
  DbConnection,
  ElementStruct,
  ImageElement,
  ImageElementData,
  Layouts,
  TextElement,
  WidgetElement,
} from "../../../module_bindings";
import { GetCoordsFromTransform, GetTransformFromCoords } from "../../../Utility/ConvertCoordinates";

export const insertElement = (
  Client: DbConnection,
  elementStruct: ElementStruct,
  activeLayout: Layouts,
  transparency?: number,
  transform?: string,
  clip?: string
) => {
  const transformCoords = GetCoordsFromTransform(transform || "translate(0px, 1100px)");
  const newTransform = GetTransformFromCoords(
    transformCoords.x,
    transformCoords.y,
    transformCoords.rotation,
    transformCoords.rotationAfterX,
    transformCoords.rotationAfterY,
    transformCoords.scaleX,
    transformCoords.scaleY
  );

  let element: any;

  switch (elementStruct.tag.toString()) {
    case DataType.TextElement.tag:
      const textElement: TextElement = elementStruct.value as TextElement;

      element = ElementStruct.TextElement({
        text: textElement.text,
        size: textElement.size,
        color: textElement.color,
        font: textElement.font,
        css: textElement.css,
      });
      break;

    case DataType.ImageElement.tag:
      const imageElement: ImageElement = elementStruct.value as ImageElement;

      element = ElementStruct.ImageElement({
        imageElementData: imageElement.imageElementData as ImageElementData,
        width: imageElement.width,
        height: imageElement.height,
      });
      break;

    case DataType.WidgetElement.tag:
      const widgetElement: WidgetElement = elementStruct.value as WidgetElement;

      element = ElementStruct.WidgetElement({
        elementDataId: widgetElement.elementDataId,
        width: widgetElement.width,
        height: widgetElement.height,
        rawData: widgetElement.rawData,
      });
      break;
  }

  Client.reducers.addElementToLayout(
    element,
    transparency || 100,
    newTransform,
    clip || "rect(0px, 0px, 0px, 0px)",
    activeLayout.id
  );
};
