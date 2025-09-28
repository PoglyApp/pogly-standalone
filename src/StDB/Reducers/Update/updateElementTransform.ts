import {
  GetCoordsFromTransform,
  GetTransformFromCoords,
} from "../../../Utility/ConvertCoordinates";
import { DbConnection } from "../../../module_bindings";

export const updateElementTransform = (Client: DbConnection, elementId: number, transform: string) => {
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

  Client.reducers.updateElementTransform(elementId, newTransform);
};

export const updateElementTransformNoViewportAdjustment = (Client: DbConnection, elementId: number, transform: string) => {
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

  Client.reducers.updateElementTransform(elementId, newTransform);
};