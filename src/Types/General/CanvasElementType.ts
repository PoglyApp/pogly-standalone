import { ElementData, Elements, ImageElementData } from "../../module_bindings";


export type CanvasElementType = {
  Elements: Elements;
  ElementData?: ElementData | ImageElementData;
  Component?: any;
};
