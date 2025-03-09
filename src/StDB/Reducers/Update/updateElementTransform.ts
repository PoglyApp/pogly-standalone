import {
  GetCoordsFromTransform,
  GetTransformFromCoords,
} from "../../../Utility/ConvertCoordinates";
import { useSpacetimeContext } from "../../../Contexts/SpacetimeContext";

export const updateElementTransform = (elementId: number, transform: string) => {
  const { Client } = useSpacetimeContext();
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

export const updateElementTransformNoViewportAdjustment = (elementId: number, transform: string) => {
  const { Client } = useSpacetimeContext();
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