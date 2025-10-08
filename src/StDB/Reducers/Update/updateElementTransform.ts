import {
  GetCoordsFromTransform,
  GetMatrixFromElement,
  GetTransformFromCoords,
} from "../../../Utility/ConvertCoordinates";
import UpdateElementTransformReducer from "../../../module_bindings/update_element_transform_reducer";

export const updateElementTransform = (elementId: number, transform: string) => {
  const matrix = GetMatrixFromElement(transform);

  const transformCoords = GetCoordsFromTransform(transform);
  const newTransform = GetTransformFromCoords(
    transformCoords.x,
    transformCoords.y,
    transformCoords.rotation,
    transformCoords.rotationAfterX,
    transformCoords.rotationAfterY,
    transformCoords.scaleX,
    transformCoords.scaleY
  );

  let transformString = newTransform;

  if (matrix) {
    transformString += " " + matrix;
  }

  UpdateElementTransformReducer.call(elementId, transformString);
};

export const updateElementTransformNoViewportAdjustment = (elementId: number, transform: string) => {
  const matrix = GetMatrixFromElement(transform);

  const transformCoords = GetCoordsFromTransform(transform);
  const newTransform = GetTransformFromCoords(
    transformCoords.x,
    transformCoords.y,
    transformCoords.rotation,
    transformCoords.rotationAfterX,
    transformCoords.rotationAfterY,
    transformCoords.scaleX,
    transformCoords.scaleY
  );

  let transformString = newTransform;

  if (matrix) {
    transformString += " " + matrix;
  }

  UpdateElementTransformReducer.call(elementId, transformString);
};
