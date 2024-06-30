import {
  GetCoordsFromTransform,
  GetTransformFromCoords,
  ViewportToStdbCoords,
} from "../../../Utility/ConvertCoordinates";
import UpdateElementTransformReducer from "../../../module_bindings/update_element_transform_reducer";

export const updateElementTransform = (elementId: number, transform: string) => {
  const transformCoords = GetCoordsFromTransform(transform);
  const coords = ViewportToStdbCoords(transformCoords.x - 0.25, transformCoords.y - 0.25);
  const newTransform = GetTransformFromCoords(
    coords.x,
    coords.y,
    transformCoords.rotation,
    transformCoords.scaleX,
    transformCoords.scaleY
  );

  UpdateElementTransformReducer.call(elementId, newTransform);
};
