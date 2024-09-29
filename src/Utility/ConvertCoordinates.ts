import Elements from "../module_bindings/elements";
import { DebugLogger } from "./DebugLogger";

export const GetCoordsFromTransform = (
  transform: string
): { x: number; y: number; rotation: number; scaleX: number | null; scaleY?: number | null } => {
  DebugLogger("Getting coordinates from transform");
  const translate = transform.substring(transform.indexOf("translate(") + 10, transform.indexOf(")"));
  const newX = parseFloat(translate.substring(0, translate.indexOf("px, ")));
  const newY = parseFloat(translate.substring(translate.indexOf(" ") + 1, translate.length - 2));

  let rotationValue;

  if (transform.includes("deg")) {
    rotationValue = parseFloat(transform.substring(transform.indexOf("rotate(") + 7, transform.indexOf("deg")));
  } else {
    rotationValue = 0;
  }

  const scaleXRegex = transform.match(/scaleX\((-?[1-9.])\)/);
  const scaleYRegex = transform.match(/scaleY\((-?[1-9.])\)/);

  let scaleX: number | null = null;
  let scaleY: number | null = null;

  if (scaleXRegex) {
    scaleX = parseFloat(scaleXRegex[1]);
  }

  if (scaleYRegex) {
    scaleY = parseFloat(scaleYRegex[1]);
  }

  return {
    x: newX,
    y: newY,
    rotation: rotationValue,
    scaleX: scaleX,
    scaleY: scaleY,
  };
};

export const GetTransformFromCoords = (
  x: number,
  y: number,
  rotation: number,
  scaleX: number | null | undefined,
  scaleY: number | null | undefined
): string => {
  DebugLogger("Getting transform from coordinates");
  let rotate = "";
  let scaleXString = "";
  let scaleYString = "";

  if (rotation !== 0) rotate = ` rotate(${rotation}deg)`;
  if (scaleX) scaleXString = ` scaleX(${scaleX})`;
  if (scaleY) scaleYString = ` scaleY(${scaleY})`;

  return `translate(${x}px, ${y}px)` + rotate + scaleXString + scaleYString;
};

export const InRenderBounds = (element: Elements) => {
  const coords = GetCoordsFromTransform(element.transform);
  let width = 0;
  let height = 0;
  let isText = false;

  switch(element.element.tag) {
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

  const visible = isText ? true : 
    coords.x + width >= 0 &&
    coords.x <= 1920 &&
    coords.y + height >= 0 &&
    coords.y <= 1080;
    
  return visible;
}