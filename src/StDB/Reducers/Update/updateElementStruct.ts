import { DbConnection, ElementStruct, ImageElement, TextElement, WidgetElement } from "../../../module_bindings";


export const updateElementStruct = (Client: DbConnection, elementId: number, element: ElementStruct) => {
  switch (element.tag) {
    case "TextElement":
      const textElement: TextElement = element.value as TextElement;

      element = ElementStruct.TextElement({
        text: textElement.text,
        size: textElement.size,
        color: textElement.color,
        font: textElement.font,
        css: textElement.css,
      });
      break;

    case "ImageElement":
      const imageElement: ImageElement = element.value as ImageElement;

      element = ElementStruct.ImageElement({
        imageElementData: imageElement.imageElementData,
        width: imageElement.width,
        height: imageElement.height,
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

  Client.reducers.updateElementStruct(elementId, element);
};
