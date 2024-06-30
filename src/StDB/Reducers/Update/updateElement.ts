import ElementStruct from "../../../module_bindings/element_struct";
import UpdateElementReducer from "../../../module_bindings/update_element_reducer";
import {
  GetCoordsFromTransform,
  GetTransformFromCoords,
  ViewportToStdbCoords,
} from "../../../Utility/ConvertCoordinates";

export const updateElement = (
  elementId: number,
  element: ElementStruct,
  transparency?: number,
  transform?: string,
  clip?: string,
  locked?: boolean
) => {
  const transformCoords = GetCoordsFromTransform(transform || "translate(0px, 0px)");
  const coords = ViewportToStdbCoords(transformCoords.x, transformCoords.y);
  const newTransform = GetTransformFromCoords(
    coords.x,
    coords.y,
    transformCoords.rotation,
    transformCoords.scaleX,
    transformCoords.scaleY
  );

  UpdateElementReducer.call(
    elementId,
    element,
    transparency || 100,
    newTransform,
    clip || "rect(0px, 0px, 0px, 0px)",
    locked || false
  );
};
