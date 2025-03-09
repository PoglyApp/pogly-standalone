import { DebugLogger } from "./DebugLogger";
import { DbConnection, ElementData, Elements, ElementStruct, ImageElementData, Layouts } from "../module_bindings";

export const UploadElementDataFromFile = (Client: DbConnection, backupFile: any) => {

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
      Client.reducers.addElementData(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
    });
  };

  reader.onerror = function (e) {
    error = e;
    console.log("error, incorrectly loaded backup file-- need to make proper modal for this");
  };
};

export const UploadElementDataFromString = (Client: DbConnection, data: string) => {

  DebugLogger("Uploading element data from string");
  var elements = JSON.parse(data) as any[];
  elements.forEach((e) => {
    Client.reducers.addElementData(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
  });
};

export const UploadBackupFromFile = (Client: DbConnection, backupFile: any) => {

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
    Array.from(Client.db.layouts.iter()).forEach((l: Layouts) => {
      if (l.id > maxLayout) maxLayout = l.id;
    });
    Array.from(Client.db.elementData.iter()).forEach((d: ElementData) => {
      if (d.id > maxData) maxData = d.id;
    });

    if (backup.data) {
      const upData: ElementData[] = JSON.parse(backup.data) as ElementData[];
      upData.forEach((e) => {
        if(e.byteArray) {
          Client.reducers.addElementDataArrayWithId(e.id, e.name, e.dataType, e.data, e.byteArray, e.dataWidth || 128, e.dataHeight || 128);
        } else {
          Client.reducers.addElementDataWithId(e.id, e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
        }
      });
    }

    if (backup.layouts) {
      const upLayouts: Layouts[] = JSON.parse(backup.layouts) as Layouts[];
      upLayouts.reverse().forEach((e) => {
        if (e.id !== 1 || e.name !== "Default" || e.createdBy !== "Server") Client.reducers.addLayoutWithId(e.id, e.name, false);
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

        Client.reducers.addElementToLayout(newElementStruct, e.transparency, e.transform, e.clip, layoutId, undefined);
      });
    }
  };
};
