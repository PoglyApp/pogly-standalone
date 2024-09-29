import AddElementToLayoutReducer from "../../../module_bindings/add_element_to_layout_reducer";
import DataType from "../../../module_bindings/data_type";
import ElementStruct from "../../../module_bindings/element_struct";
import ImageElement from "../../../module_bindings/image_element";
import ImageElementData from "../../../module_bindings/image_element_data";
import Layouts from "../../../module_bindings/layouts";
import TextElement from "../../../module_bindings/text_element";
import WidgetElement from "../../../module_bindings/widget_element";
import {
  GetCoordsFromTransform,
  GetTransformFromCoords,
} from "../../../Utility/ConvertCoordinates";
import { DebugLogger } from "../../../Utility/DebugLogger";

export const insertElement = (
  elementStruct: ElementStruct,
  activeLayout: Layouts,
  transparency?: number,
  transform?: string,
  clip?: string
) => {
  DebugLogger("Inserting new element");

  const transformCoords = GetCoordsFromTransform(transform || "translate(0px, 1100px)");
  const newTransform = GetTransformFromCoords(
    transformCoords.x,
    transformCoords.y,
    transformCoords.rotation,
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

  AddElementToLayoutReducer.call(
    element,
    transparency || 100,
    newTransform,
    clip || "rect(0px, 0px, 0px, 0px)",
    activeLayout.id,
    null
  );
};
