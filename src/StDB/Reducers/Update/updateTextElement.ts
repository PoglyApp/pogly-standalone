import Elements from "../../../module_bindings/elements";
import ElementStruct from "../../../module_bindings/element_struct";
import TextElement from "../../../module_bindings/text_element";
import UpdateTextElementColorReducer from "../../../module_bindings/update_text_element_color_reducer";
import UpdateTextElementFontReducer from "../../../module_bindings/update_text_element_font_reducer";
import UpdateTextElementSizeReducer from "../../../module_bindings/update_text_element_size_reducer";
import UpdateTextElementTextReducer from "../../../module_bindings/update_text_element_text_reducer";
import UpdateTextElementShadowReducer from "../../../module_bindings/update_text_element_shadow_reducer";

export const updateTextElement = (elementId: number, elementStruct: ElementStruct) => {
  const textElement = Elements.findById(elementId);
  if (!textElement) return;

  const oldTextStruct: TextElement = textElement.element.value as TextElement;
  const newTextStruct: TextElement = elementStruct.value as TextElement;

  switch (true) {
    case oldTextStruct.color !== newTextStruct.color:
      UpdateTextElementColorReducer.call(elementId, newTextStruct.color);
      break;

    case oldTextStruct.font !== newTextStruct.font:
      UpdateTextElementFontReducer.call(elementId, newTextStruct.font);
      break;

    case oldTextStruct.size !== newTextStruct.size:
      UpdateTextElementSizeReducer.call(elementId, newTextStruct.size);
      break;

    case oldTextStruct.text !== newTextStruct.text:
      UpdateTextElementTextReducer.call(elementId, newTextStruct.text);
      break;

    case oldTextStruct.css !== newTextStruct.css:
      UpdateTextElementShadowReducer.call(elementId, newTextStruct.css);
      break;
  }
};
