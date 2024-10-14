import Elements from "../module_bindings/elements";
import ElementData from "../module_bindings/element_data";
import { updateElementStruct } from "../StDB/Reducers/Update/updateElementStruct";
import { updateElementTransform } from "../StDB/Reducers/Update/updateElementTransform";
import { getTransformValues } from "./GetTransformValues";
import ElementStruct from "../module_bindings/element_struct";
import UpdateElementStructReducer from "../module_bindings/update_element_struct_reducer";
import ImageElementData from "../module_bindings/image_element_data";
import WidgetElement from "../module_bindings/widget_element";
import DeleteElementReducer from "../module_bindings/delete_element_reducer";
import DeleteElementDataByIdReducer from "../module_bindings/delete_element_data_by_id_reducer";
import UpdateElementLockedReducer from "../module_bindings/update_element_locked_reducer";
import UpdateElementTransparencyReducer from "../module_bindings/update_element_transparency_reducer";
import { WidgetVariableType } from "../Types/General/WidgetVariableType";
import UpdateWidgetElementRawDataReducer from "../module_bindings/update_widget_element_raw_data_reducer";
import UpdateWidgetElementDataIdReducer from "../module_bindings/update_widget_element_data_id_reducer";
import { DebugLogger } from "./DebugLogger";

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

export const handleFlipElement = (vertical: boolean, selectedElement: Elements, handleClose: Function) => {
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

  updateElementTransform(selectedElement.id, transformString);

  element.style.transform = transformString;

  handleClose();
};

export const handleResetTransform = (elements: Elements, type: TransformType, handleClose: Function) => {
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
              const imgElementData: ElementData | undefined = ElementData.findById(dataId.value);

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

                updateElementStruct(elements.id, newImageElement);
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

                updateElementStruct(elements.id, newImageElement);
                image.remove();
              };
              break;
          }
          break;

        case "WidgetElement":
          const widgetElement: ElementStruct = elements.element as ElementStruct.WidgetElement;
          const wgtElementData: ElementData | undefined = ElementData.findById(widgetElement.value.elementDataId);

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

            updateElementStruct(elements.id, newWidgetElement);
          }
          break;

        case "TextElement":
          const textElement: ElementStruct = elements.element as ElementStruct.TextElement;
          element.style.width = `auto`;
          element.style.height = `auto`;
          updateElementStruct(elements.id, textElement);
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

      updateElementTransform(elements.id, transformString_Rotation);

      element.style.transform = transformString_Rotation;
      break;

    case TransformType.Warp:
      // const oldTransform_Warp = getTransformValues(element.style.transform);

      // const updatedTransform_Warp = oldTransform_Warp.flatMap((obj) =>
      //   obj.transformFunction !== "matrix3d" ? obj : null
      // );

      // const transformString_Warp = updatedTransform_Warp
      //   .map((obj) => (obj ? `${obj.transformFunction}(${obj.transformValue})` : null))
      //   .join(" ");

      // updateElementTransform(elements.id, transformString_Warp);

      // element.style.transform = transformString_Warp;
      break;

    case TransformType.Clip:
      // updateElementClip(elements.id, "");
      // element.style.clipPath = "";
      break;
  }

  handleClose();
};

export const handleLocked = (selectedElement: Elements, handleClose: Function) => {
  if (!selectedElement) return;
  DebugLogger("Handling locked");
  const lockedBool = document.getElementById(selectedElement.id.toString())?.getAttribute("data-locked") === "true";

  UpdateElementLockedReducer.call(selectedElement.id, !lockedBool);

  handleClose();
};

export const handleToggle = (selectedElement: Elements, handleClose: Function) => {
  if (!selectedElement || selectedElement.element.tag !== "WidgetElement") return;
  DebugLogger("Handling toggle");

  //const size = ViewportToStdbSize(selectedElement.element.value.width,selectedElement.element.value.height);
  const element = Elements.findById(selectedElement.id);

  if (!element) return;

  const widgetStruct: ElementStruct = ElementStruct.WidgetElement({
    elementDataId: selectedElement.element.value.elementDataId,
    height: (element.element.value as WidgetElement).height,
    width: (element.element.value as WidgetElement).width,
    rawData: (element.element.value as WidgetElement).rawData,
  });

  UpdateElementStructReducer.call(selectedElement.id, widgetStruct);
  handleClose();
};

export const handleDelete = (
  selectedElement: Elements,
  setSelected: Function,
  setSelectoTargets: Function,
  handleClose: Function
) => {
  DebugLogger("Handling element deletion");
  DeleteElementReducer.call(selectedElement.id);
  setSelected(undefined);
  setSelectoTargets([]);
  handleClose();
};

export const handleDeleteElementData = (selectedElementData: ElementData, handleClose: Function) => {
  DebugLogger("Handling element data deletion");
  DeleteElementDataByIdReducer.call(selectedElementData.id);
  handleClose();
};

export const handleTransparency = (selectedElement: Elements, value: any) => {
  DebugLogger("Handling element transparency");
  UpdateElementTransparencyReducer.call(selectedElement.id, value);
};

export const handleWidgetToggle = (selectedElementId: number, variable: WidgetVariableType, handleClose: Function) => {
  DebugLogger("Handling widget toggle");
  const widgetElement: WidgetElement = Elements.findById(selectedElementId)?.element.value as WidgetElement;

  if (widgetElement.rawData) {
    const rawDataJson = JSON.parse(widgetElement.rawData);
    const variableIndex = rawDataJson.variables.findIndex(
      (v: WidgetVariableType) => v.variableName === variable.variableName
    );

    rawDataJson.variables[variableIndex].variableValue = !rawDataJson.variables[variableIndex].variableValue;

    UpdateWidgetElementRawDataReducer.call(selectedElementId, JSON.stringify(rawDataJson));
  } else {
    const elementData: ElementData = ElementData.findById(widgetElement.elementDataId)!;

    const elementDataJson = JSON.parse(elementData.data);

    const variableIndex = elementDataJson.variables.findIndex(
      (v: WidgetVariableType) => v.variableName === variable.variableName
    );

    elementDataJson.variables[variableIndex].variableValue = !elementDataJson.variables[variableIndex].variableValue;

    UpdateWidgetElementRawDataReducer.call(selectedElementId, JSON.stringify(elementDataJson));
    UpdateWidgetElementDataIdReducer.call(selectedElementId, elementData.id);
  }

  handleClose();
};
