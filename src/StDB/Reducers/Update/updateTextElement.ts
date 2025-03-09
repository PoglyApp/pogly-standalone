import { useSpacetimeContext } from "../../../Contexts/SpacetimeContext";
import { ElementStruct, TextElement } from "../../../module_bindings";

export const updateTextElement = (elementId: number, elementStruct: ElementStruct) => {
  const { Client } = useSpacetimeContext();
  const textElement = Client.db.elements.id.find(elementId);
  if (!textElement) return;

  const oldTextStruct: TextElement= textElement.element.value as TextElement;
  const newTextStruct: TextElement = elementStruct.value as TextElement;

  switch (true) {
    case oldTextStruct.color !== newTextStruct.color:
      Client.reducers.updateTextElementColor(elementId, newTextStruct.color);
      break;

    case oldTextStruct.font !== newTextStruct.font:
      Client.reducers.updateTextElementFont(elementId, newTextStruct.font);
      break;

    case oldTextStruct.size !== newTextStruct.size:
      Client.reducers.updateTextElementSize(elementId, newTextStruct.size);
      break;

    case oldTextStruct.text !== newTextStruct.text:
      Client.reducers.updateTextElementText(elementId, newTextStruct.text);
      break;

    case oldTextStruct.css !== newTextStruct.css:
      Client.reducers.updateTextElementShadow(elementId, newTextStruct.css);
      break;
  }
};
