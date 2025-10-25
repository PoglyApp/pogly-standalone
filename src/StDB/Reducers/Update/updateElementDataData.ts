import { DataType, DbConnection } from "../../../module_bindings";
import { ElementDataType } from "../../../Types/General/ElementDataType";

export const updateElementDataData = (Client: DbConnection, dataId: number, elementData: ElementDataType) => {
  switch (elementData.DataType) {
    case DataType.TextElement:
      Client.reducers.updateElementDataData(dataId, elementData.Data);
      break;

    case DataType.ImageElement:
      getBase64(elementData.Data, (result: any) => {
        Client.reducers.updateElementDataData(dataId, result);
      });
      break;

    case DataType.WidgetElement:
      Client.reducers.updateElementDataData(dataId, elementData.Data);
      break;
  }
};

const getBase64 = (file: any, cb: any) => {
  let reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = function () {
    cb(reader.result);
  };

  reader.onerror = function () {};
};
