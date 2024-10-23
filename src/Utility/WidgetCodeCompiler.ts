import ElementData from "../module_bindings/element_data";
import { DebugLogger } from "./DebugLogger";

// "Compiler" is a very generous term for what this method does
export const WidgetCodeCompiler = (
  widgetWidth?: Number,
  widgetHeight?: Number,
  elementDataId?: number,
  rawData?: string
) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  DebugLogger("'Compiling' widget");
  let widgetData: any = rawData ? JSON.parse(rawData) : null;

  if (!widgetData) {
    if (!elementDataId) return "";
    const elementData = ElementData.findById(elementDataId);
    if (!elementData) return "";
    const data = elementData.data;

    widgetData = JSON.parse(data);
  }

  const headerTag: string = `<head>${widgetData.headerTag} <style> html { pointer-events: none; } ${widgetData.styleTag}</style> </head>`;
  const bodyTag: string = `<body>${widgetData.bodyTag} <script>${widgetData.scriptTag}</script> </body>`;

  let htmlTag: string = `${headerTag} ${bodyTag}`;

  if (widgetData.variables && widgetData.variables.length !== 0) {
    widgetData.variables.forEach((variable: any) => {
      htmlTag = htmlTag.replaceAll(`{${variable.variableName}}`, `${variable.variableValue}`);
    });
  }

  htmlTag = htmlTag.replaceAll("{is_overlay}", isOverlay.toString());

  if (widgetWidth && widgetHeight) {
    htmlTag = htmlTag.replaceAll("{widget_width}", `${widgetWidth.toString()}`);
    htmlTag = htmlTag.replaceAll("{widget_height}", `${widgetHeight.toString()}`);
  }

  return htmlTag;
};
