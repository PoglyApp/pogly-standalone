import { WidgetVariableType } from "../Types/General/WidgetVariableType";
import { DebugLogger } from "./DebugLogger";
import { DbConnection } from "../module_bindings";

export const GetWidgetCodeJsonByElementDataID = (Client: DbConnection, elementDataId: number) => {

  DebugLogger("Getting widget code JSON by element data ID");
  const widgetData = Client.db.elementData.id.find(elementDataId);
  
  if (!widgetData) return;
  const jsonObject = JSON.parse(widgetData.data);

  return {
    widgetName: widgetData.name || "",
    widgetWidth: widgetData.dataWidth || "",
    widgetHeight: widgetData.dataHeight || "",
    headerTag: jsonObject.headerTag || "",
    bodyTag: jsonObject.bodyTag || "",
    styleTag: jsonObject.styleTag || "",
    scriptTag: jsonObject.scriptTag || "",
    variables: jsonObject.variables.filter((variable: WidgetVariableType) => variable.variableName !== "") || [],
  };
};

export const StringifyWidgetCode = (
  headerCode: string,
  bodyCode: string,
  styleCode: string,
  scriptCode: string,
  variables: WidgetVariableType[]
) => {
  DebugLogger("Stringifying widget code");

  const jsonString: string = JSON.stringify({
    headerTag: headerCode,
    bodyTag: bodyCode,
    styleTag: styleCode,
    scriptTag: scriptCode,
    variables: variables.filter((variable: WidgetVariableType) => variable.variableName !== ""),
  });

  return jsonString;
};

export const StringifyRawDataWidgetCode = (
  widgetName: string,
  widgetWidth: number,
  widgetHeight: number,
  headerCode: string,
  bodyCode: string,
  styleCode: string,
  scriptCode: string,
  variables: WidgetVariableType[]
) => {
  DebugLogger("Stringifying raw data widget code");
  const jsonString: string = JSON.stringify({
    widgetName: widgetName,
    widgetWidth: widgetWidth,
    widgetHeight: widgetHeight,
    headerTag: headerCode,
    bodyTag: bodyCode,
    styleTag: styleCode,
    scriptTag: scriptCode,
    variables: variables.filter((variable: WidgetVariableType) => variable.variableName !== ""),
  });

  return jsonString;
};
