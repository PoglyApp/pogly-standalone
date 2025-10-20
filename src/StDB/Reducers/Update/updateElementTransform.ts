import {
  GetCoordsFromTransform,
  GetMatrixFromElement,
  GetTransformFromCoords,
} from "../../../Utility/ConvertCoordinates";
import { DbConnection } from "../../../module_bindings";

export const updateElementTransform = (Client: DbConnection, elementId: number, transform: string) => {
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

  Client.reducers.updateElementTransform(elementId, transformString);
};

export const updateElementTransformNoViewportAdjustment = (
  Client: DbConnection,
  elementId: number,
  transform: string
) => {
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

  Client.reducers.updateElementTransform(elementId, transformString);
};
