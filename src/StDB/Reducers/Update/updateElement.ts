import ElementStruct from "../../../module_bindings/element_struct";
import UpdateElementReducer from "../../../module_bindings/update_element_reducer";
import {
  GetCoordsFromTransform,
  GetTransformFromCoords,
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
  const newTransform = GetTransformFromCoords(
    transformCoords.x,
    transformCoords.y,
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
