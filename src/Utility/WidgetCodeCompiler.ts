import ElementData from "../module_bindings/element_data";

// "Compiler" is a very generous term for what this method does
export const WidgetCodeCompiler = (elementDataId?: number, rawData?: string) => {
  let widgetData: any = rawData ? JSON.parse(rawData) : null;

  if (!widgetData) {
    const elementData: string = ElementData.findById(elementDataId!)?.data!;

    widgetData = JSON.parse(elementData);
  }

  const headerTag: string = `<head>${widgetData.headerTag} <style>${widgetData.styleTag}</style> </head>`;
  const bodyTag: string = `<body>${widgetData.bodyTag} <script>${widgetData.scriptTag}</script> </body>`;

  let htmlTag: string = `<!DOCTYPE html> <html>${headerTag} ${bodyTag}</html>`;

  if (widgetData.variables && widgetData.variables.length !== 0) {
    widgetData.variables.forEach((variable: any) => {
      htmlTag = htmlTag.replaceAll(`{${variable.variableName}}`, `${variable.variableValue}`);
    });
  }

  return htmlTag;
};
