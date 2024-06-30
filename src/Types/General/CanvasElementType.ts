import Elements from "../../module_bindings/elements";
import ElementData from "../../module_bindings/element_data";
import ImageElementData from "../../module_bindings/image_element_data";

export type CanvasElementType = {
  Elements: Elements;
  ElementData?: ElementData | ImageElementData;
  Component?: any;
};
