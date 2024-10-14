import AddElementDataArrayWithIdReducer from "../module_bindings/add_element_data_array_with_id_reducer";
import AddElementDataReducer from "../module_bindings/add_element_data_reducer";
import AddElementDataWithIdReducer from "../module_bindings/add_element_data_with_id_reducer";
import AddElementToLayoutReducer from "../module_bindings/add_element_to_layout_reducer";
import AddLayoutWithIdReducer from "../module_bindings/add_layout_with_id_reducer";
import ElementData from "../module_bindings/element_data";
import ElementStruct from "../module_bindings/element_struct";
import Elements from "../module_bindings/elements";
import ImageElementData from "../module_bindings/image_element_data";
import Layouts from "../module_bindings/layouts";
import { DebugLogger } from "./DebugLogger";

export const UploadElementDataFromFile = (backupFile: any) => {
  DebugLogger("Uploading element data from file");
  let reader = new FileReader();
  let data;
  let error;

  reader.readAsText(backupFile);

  reader.onload = function () {
    if (!reader.result) return;

    data = reader.result.toString();
    var elements = JSON.parse(data) as any[];
    elements.forEach((e) => {
      AddElementDataReducer.call(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
    });
  };

  reader.onerror = function (e) {
    error = e;
    console.log("error, incorrectly loaded backup file-- need to make proper modal for this");
  };
};

export const UploadElementDataFromString = (data: string) => {
  DebugLogger("Uploading element data from string");
  var elements = JSON.parse(data) as any[];
  elements.forEach((e) => {
    AddElementDataReducer.call(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
  });
};

export const UploadBackupFromFile = (backupFile: any) => {
  DebugLogger("Uploading backup from a file");
  let reader = new FileReader();
  let data;
  let error;

  reader.readAsText(backupFile);

  reader.onload = function () {
    if (!reader.result) return;

    data = reader.result.toString();
    var backup = JSON.parse(data) as {
      data: string | null;
      elements: string | null;
      layouts: string | null;
    };

    let maxLayout = 0;
    let maxData = 0;
    Layouts.all().forEach((l) => {
      if (l.id > maxLayout) maxLayout = l.id;
    });
    ElementData.all().forEach((d) => {
      if (d.id > maxData) maxData = d.id;
    });

    if (backup.data) {
      const upData: ElementData[] = JSON.parse(backup.data) as ElementData[];
      upData.forEach((e) => {
        if(e.byteArray) {
          AddElementDataArrayWithIdReducer.call(e.id, e.name, e.dataType, e.data, e.byteArray, e.dataWidth || 128, e.dataHeight || 128);
        } else {
          AddElementDataWithIdReducer.call(e.id, e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
        }
      });
    }

    if (backup.layouts) {
      const upLayouts: Layouts[] = JSON.parse(backup.layouts) as Layouts[];
      upLayouts.reverse().forEach((e) => {
        if (e.id !== 1 || e.name !== "Default" || e.createdBy !== "Server") AddLayoutWithIdReducer.call(e.id, e.name, false);
      });
    }

    if (backup.elements) {
      const upElements: Elements[] = JSON.parse(backup.elements) as Elements[];
      upElements.forEach((e) => {
        var layoutId = backup.layouts ? e.layoutId + maxLayout - 1 : 1;

        var newElementStruct: ElementStruct;

        switch (e.element.tag) {
          case "TextElement":
            newElementStruct = ElementStruct.TextElement({
              text: e.element.value.text,
              size: e.element.value.size,
              color: e.element.value.color,
              font: e.element.value.font,
              css: e.element.value.css,
            });
            break;
          case "ImageElement":
            var eData: ImageElementData;
            switch (e.element.value.imageElementData.tag) {
              case "ElementDataId":
                eData = ImageElementData.ElementDataId(e.element.value.imageElementData.value + maxData);
                break;
              case "RawData":
                eData = ImageElementData.RawData(e.element.value.imageElementData.value);
            }

            newElementStruct = ElementStruct.ImageElement({
              imageElementData: eData,
              width: e.element.value.width,
              height: e.element.value.height,
            });
            break;
          case "WidgetElement":
            newElementStruct = ElementStruct.WidgetElement({
              elementDataId: e.element.value.elementDataId + maxData,
              width: e.element.value.width,
              height: e.element.value.height,
              rawData: e.element.value.rawData,
            });
            break;
        }

        AddElementToLayoutReducer.call(newElementStruct, e.transparency, e.transform, e.clip, layoutId, null);
      });
    }
  };
};
