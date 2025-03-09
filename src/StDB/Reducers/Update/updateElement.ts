import { useSpacetimeContext } from "../../../Contexts/SpacetimeContext";
import { ElementStruct } from "../../../module_bindings";
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
  const { Client } = useSpacetimeContext();
  const transformCoords = GetCoordsFromTransform(transform || "translate(0px, 0px)");
  const newTransform = GetTransformFromCoords(
    transformCoords.x,
    transformCoords.y,
    transformCoords.rotation,
    transformCoords.rotationAfterX,
    transformCoords.rotationAfterY,
    transformCoords.scaleX,
    transformCoords.scaleY
  );

  Client.reducers.updateElement(
    elementId,
    element,
    transparency || 100,
    newTransform,
    clip || "rect(0px, 0px, 0px, 0px)",
    locked || false
  );
};
