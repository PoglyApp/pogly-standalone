import { updateElementStruct } from "../StDB/Reducers/Update/updateElementStruct";
import { updateElementTransform } from "../StDB/Reducers/Update/updateElementTransform";
import { getTransformValues } from "./GetTransformValues";
import { WidgetVariableType } from "../Types/General/WidgetVariableType";
import { DebugLogger } from "./DebugLogger";
import {
  DbConnection,
  ElementData,
  Elements,
  ElementStruct,
  ImageElementData,
  WidgetElement,
} from "../module_bindings";

interface TransformObject {
  transformFunction: string;
  transformValue: string;
}

export enum TransformType {
  Scale,
  Rotation,
  Warp,
  Clip,
}

export const handleEditTransform = (type: TransformType, setTransformType: Function) => {
  DebugLogger("Handling transform edit");

  switch (type) {
    case TransformType.Scale:
      setTransformType({
        size: true,
        warp: false,
        clip: false,
      });
      break;

    case TransformType.Warp:
      setTransformType({
        size: false,
        warp: true,
        clip: false,
      });
      break;

    case TransformType.Clip:
      setTransformType({
        size: false,
        warp: false,
        clip: true,
      });
      break;
  }
};

export const handleFlipElement = (
  Client: DbConnection,
  vertical: boolean,
  selectedElement: Elements,
  handleClose?: Function
) => {
  DebugLogger("Handling element flip");
  const element = document.getElementById(selectedElement.id.toString());

  if (!element) return;

  const oldTransform = getTransformValues(element.style.transform);

  let updatedTransform: TransformObject[] = [...oldTransform];

  const scaleType = vertical ? "scaleY" : "scaleX";
  const rotationExists = updatedTransform.find((obj) => obj.transformFunction === scaleType);

  if (rotationExists) {
    updatedTransform = updatedTransform.map((obj) =>
      obj.transformFunction === scaleType ? { ...obj, transformValue: obj.transformValue === "1" ? "-1" : "1" } : obj
    );
  } else {
    updatedTransform.push({
      transformFunction: scaleType,
      transformValue: "-1",
    });
  }

  const transformString = updatedTransform.map((obj) => `${obj.transformFunction}(${obj.transformValue})`).join(" ");

  updateElementTransform(Client, selectedElement.id, transformString);

  element.style.transform = transformString;

  if (handleClose) handleClose();
};

export const handleResetTransform = (
  Client: DbConnection,
  elements: Elements,
  type: TransformType,
  handleClose: Function
) => {
  DebugLogger("Handling transform reset");
  const element = document.getElementById(elements.id.toString());

  if (!element) return;

  switch (type) {
    case TransformType.Scale:
      switch (elements.element.tag) {
        case "ImageElement":
          const imageElement: ElementStruct = elements.element as ElementStruct.ImageElement;

          switch (imageElement.value.imageElementData.tag) {
            case "ElementDataId":
              const dataId: ImageElementData.ElementDataId = imageElement.value
                .imageElementData as ImageElementData.ElementDataId;
              const imgElementData: ElementData | undefined = Client.db.elementData.id.find(dataId.value);

              if (imgElementData !== undefined) {
                const newWidth = imgElementData.dataWidth;
                const newHeight = imgElementData.dataHeight;
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;

                const newImageElement: ElementStruct = ElementStruct.ImageElement({
                  width: newWidth,
                  height: newHeight,
                  imageElementData: dataId,
                });

                updateElementStruct(Client, elements.id, newImageElement);
              }
              break;

            case "RawData":
              const rawData: ImageElementData.RawData = imageElement.value.imageElementData as ImageElementData.RawData;

              var image = new Image();
              image.src = rawData.value;
              image.onload = function () {
                const newWidth = image.width;
                const newHeight = image.height;
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;

                const newImageElement: ElementStruct = ElementStruct.ImageElement({
                  width: newWidth,
                  height: newHeight,
                  imageElementData: rawData,
                });

                updateElementStruct(Client, elements.id, newImageElement);
                image.remove();
              };
              break;
          }
          break;

        case "WidgetElement":
          const widgetElement: ElementStruct = elements.element as ElementStruct.WidgetElement;
          const wgtElementData: ElementData | undefined = Client.db.elementData.id.find(
            widgetElement.value.elementDataId
          );

          if (wgtElementData !== undefined) {
            const newWidth = wgtElementData.dataWidth;
            const newHeight = wgtElementData.dataHeight;
            element.style.width = `${newWidth}px`;
            element.style.height = `${newHeight}px`;

            const newWidgetElement: ElementStruct = ElementStruct.WidgetElement({
              width: newWidth,
              height: newHeight,
              rawData: widgetElement.value.rawData,
              elementDataId: widgetElement.value.elementDataId,
            });

            updateElementStruct(Client, elements.id, newWidgetElement);
          }
          break;

        case "TextElement":
          const textElement: ElementStruct = elements.element as ElementStruct.TextElement;
          element.style.width = `auto`;
          element.style.height = `auto`;
          updateElementStruct(Client, elements.id, textElement);
          break;
      }
      break;

    case TransformType.Rotation:
      const oldTransform_Rotation = getTransformValues(element.style.transform);

      const updatedTransform_Rotation = oldTransform_Rotation.flatMap((obj) =>
        obj.transformFunction !== "rotate" ? obj : null
      );

      const transformString_Rotation = updatedTransform_Rotation
        .map((obj) => (obj ? `${obj.transformFunction}(${obj.transformValue})` : null))
        .join(" ");

      updateElementTransform(Client, elements.id, transformString_Rotation);

      element.style.transform = transformString_Rotation;
      break;

    case TransformType.Warp:
      const newTransform = element.style.transform.replace(/matrix3d?\([^)]*\)\s*/g, "").trim();
      updateElementTransform(Client, elements.id, newTransform);
      element.style.transform = newTransform;
      break;

    case TransformType.Clip:
      Client.reducers.updateElementClip(elements.id, "");
      element.style.removeProperty("clip-path");
      break;
  }

  handleClose();
};

export const handleLocked = (Client: DbConnection, selectedElement: Elements, handleClose: Function) => {
  if (!selectedElement) return;

  DebugLogger("Handling locked");
  const lockedBool = document.getElementById(selectedElement.id.toString())?.getAttribute("data-locked") === "true";

  Client.reducers.updateElementLocked(selectedElement.id, !lockedBool);

  handleClose();
};

export const handleToggle = (Client: DbConnection, selectedElement: Elements, handleClose: Function) => {
  if (!selectedElement || selectedElement.element.tag !== "WidgetElement") return;
  DebugLogger("Handling toggle");

  //const size = ViewportToStdbSize(selectedElement.element.value.width,selectedElement.element.value.height);
  const element = Client.db.elements.id.find(selectedElement.id);

  if (!element) return;

  const widgetStruct: ElementStruct = ElementStruct.WidgetElement({
    elementDataId: selectedElement.element.value.elementDataId,
    height: (element.element.value as WidgetElement).height,
    width: (element.element.value as WidgetElement).width,
    rawData: (element.element.value as WidgetElement).rawData,
  });

  Client.reducers.updateElementStruct(selectedElement.id, widgetStruct);
  handleClose();
};

export const handleDelete = (
  Client: DbConnection,
  selectedElement: Elements,
  setSelected: Function,
  setSelectoTargets: Function,
  handleClose: Function
) => {
  DebugLogger("Handling element deletion");
  Client.reducers.deleteElement(selectedElement.id);
  setSelected(undefined);
  setSelectoTargets([]);
  handleClose();
};

export const handleDeleteElementData = (
  Client: DbConnection,
  selectedElementData: ElementData,
  handleClose: Function
) => {
  DebugLogger("Handling element data deletion");
  Client.reducers.deleteElementDataById(selectedElementData.id);
  handleClose();
};

export const handleTransparency = (
  Client: DbConnection,
  selectedElement: Elements,
  setTransparencyState: Function,
  value: any
) => {
  DebugLogger("Handling element transparency");
  setTransparencyState(value);
  Client.reducers.updateElementTransparency(selectedElement.id, value);
};

export const handleHide = (
  Client: DbConnection,
  selectedElement: Elements,
  setTransparencyState: Function,
  value: any
) => {
  DebugLogger("Handling element hiding/showing");
  setTransparencyState(value);
  Client.reducers.updateElementTransparency(selectedElement.id, value);
};

export const handleWidgetToggle = (
  Client: DbConnection,
  selectedElementId: number,
  variable: WidgetVariableType,
  handleClose: Function
) => {
  DebugLogger("Handling widget toggle");
  const widgetElement: WidgetElement = Client.db.elements.id.find(selectedElementId)?.element.value as WidgetElement;

  if (widgetElement.rawData) {
    const rawDataJson = JSON.parse(widgetElement.rawData);
    const variableIndex = rawDataJson.variables.findIndex(
      (v: WidgetVariableType) => v.variableName === variable.variableName
    );

    rawDataJson.variables[variableIndex].variableValue = !rawDataJson.variables[variableIndex].variableValue;

    Client.reducers.updateWidgetElementRawData(selectedElementId, JSON.stringify(rawDataJson));
  } else {
    const elementData: ElementData = Client.db.elementData.id.find(widgetElement.elementDataId)!;

    const elementDataJson = JSON.parse(elementData.data);

    const variableIndex = elementDataJson.variables.findIndex(
      (v: WidgetVariableType) => v.variableName === variable.variableName
    );

    elementDataJson.variables[variableIndex].variableValue = !elementDataJson.variables[variableIndex].variableValue;

    Client.reducers.updateWidgetElementRawData(selectedElementId, JSON.stringify(elementDataJson));
    Client.reducers.updateWidgetElementDataId(selectedElementId, elementData.id);
  }

  handleClose();
};
