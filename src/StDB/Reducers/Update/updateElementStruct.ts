import { ViewportToStdbFontSize, ViewportToStdbSize } from "../../../Utility/ConvertCoordinates";
import ElementStruct from "../../../module_bindings/element_struct";
import ImageElement from "../../../module_bindings/image_element";
import TextElement from "../../../module_bindings/text_element";
import UpdateElementStructReducer from "../../../module_bindings/update_element_struct_reducer";
import WidgetElement from "../../../module_bindings/widget_element";

export const updateElementStruct = (elementId: number, element: ElementStruct) => {
  switch (element.tag) {
    case "TextElement":
      const textElement: TextElement = element.value as TextElement;

      element = ElementStruct.TextElement({
        text: textElement.text,
        size: ViewportToStdbFontSize(textElement.size).fontSize,
        color: textElement.color,
        font: textElement.font,
        shadow: textElement.shadow,
      });
      break;

    case "ImageElement":
      const imageElement: ImageElement = element.value as ImageElement;
      const imgSize = ViewportToStdbSize(imageElement.width, imageElement.height);

      element = ElementStruct.ImageElement({
        imageElementData: imageElement.imageElementData,
        width: imgSize.width,
        height: imgSize.height,
      });
      break;

    case "WidgetElement":
      const widgetElement: WidgetElement = element.value as WidgetElement;

      element = ElementStruct.WidgetElement({
        elementDataId: widgetElement.elementDataId,
        width: widgetElement.width,
        height: widgetElement.height,
        rawData: widgetElement.rawData,
      });
      break;
  }

  UpdateElementStructReducer.call(elementId, element);
};
