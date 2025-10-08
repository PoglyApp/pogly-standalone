import Elements from "../module_bindings/elements";
import { DebugLogger } from "./DebugLogger";

export const GetCoordsFromTransform = (
  transform: string
): {
  x: number;
  y: number;
  rotation: number;
  rotationAfterX: boolean;
  rotationAfterY: boolean;
  scaleX: number | null;
  scaleY?: number | null;
} => {
  DebugLogger("Getting coordinates from transform");
  const translate = transform.substring(transform.indexOf("translate(") + 10, transform.indexOf(")"));
  const newX = parseFloat(translate.substring(0, translate.indexOf("px, ")));
  const newY = parseFloat(translate.substring(translate.indexOf(" ") + 1, translate.length - 2));

  let rotationValue;
  let rotationPosition;

  if (transform.includes("deg")) {
    rotationValue = parseFloat(transform.substring(transform.indexOf("rotate(") + 7, transform.indexOf("deg")));
    rotationPosition = transform.indexOf("deg");
  } else {
    rotationValue = 0;
    rotationPosition = 0;
  }

  const scaleXRegex = transform.match(/scaleX\((-?[1-9.])\)/);
  const scaleYRegex = transform.match(/scaleY\((-?[1-9.])\)/);

  let rotationAfterX = false;
  let rotationAfterY = false;
  let scaleX: number | null = null;
  let scaleXPosition = 0;
  let scaleY: number | null = null;
  let scaleYPosition = 0;

  if (scaleXRegex) {
    scaleX = parseFloat(scaleXRegex[1]);
    scaleXPosition = transform.indexOf("scaleX");
    if (rotationPosition > scaleXPosition) rotationAfterX = true;
  }

  if (scaleYRegex) {
    scaleY = parseFloat(scaleYRegex[1]);
    scaleYPosition = transform.indexOf("scaleY");
    if (rotationPosition > scaleYPosition) rotationAfterY = true;
  }

  return {
    x: newX,
    y: newY,
    rotation: rotationValue,
    rotationAfterX: rotationAfterX,
    rotationAfterY: rotationAfterY,
    scaleX: scaleX,
    scaleY: scaleY,
  };
};

export const GetTransformFromCoords = (
  x: number,
  y: number,
  rotation: number,
  rotationAfterX: boolean,
  rotationAfterY: boolean,
  scaleX: number | null | undefined,
  scaleY: number | null | undefined
): string => {
  DebugLogger("Getting transform from coordinates");
  let rotate = "";
  let scaleXString = "";
  let scaleYString = "";

  if (scaleX) scaleXString = ` scaleX(${scaleX})`;
  if (scaleY) scaleYString = ` scaleY(${scaleY})`;
  if (rotation !== 0) rotate = ` rotate(${rotation}deg)`;

  let scaleRot = "";

  if (!rotationAfterX && !rotationAfterY) scaleRot = rotate + scaleXString + scaleYString;
  if (rotationAfterX && !rotationAfterY) scaleRot = scaleXString + rotate + scaleYString;
  if (!rotationAfterX && rotationAfterY) scaleRot = scaleYString + rotate + scaleXString;
  if (rotationAfterX && rotationAfterY) scaleRot = scaleXString + scaleYString + rotate;

  return `translate(${x}px, ${y}px)` + scaleRot;
};

export const InRenderBounds = (element: Elements) => {
  const coords = GetCoordsFromTransform(element.transform);
  let width = 0;
  let height = 0;
  let isText = false;

  switch (element.element.tag) {
    case "TextElement":
      isText = true;
      break;
    case "ImageElement":
      width = element.element.value.width;
      height = element.element.value.height;
      break;
    case "WidgetElement":
      width = element.element.value.width;
      height = element.element.value.height;
      break;
  }

  const visible = isText
    ? true
    : coords.x + width >= 0 && coords.x <= 1920 && coords.y + height >= 0 && coords.y <= 1080;

  return visible;
};

export const GetMatrixFromElement = (transform: string) => {
  const match = transform.match(/matrix3d?\([^)]*\)/);

  return match ? match[0] : null;
};
