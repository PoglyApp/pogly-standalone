import { DataType, DbConnection } from "../../../module_bindings";
import { ElementDataType } from "../../../Types/General/ElementDataType";

export const updateElementData = (Client: DbConnection, dataId: number, elementData: ElementDataType) => {
  switch (elementData.DataType) {
    case DataType.TextElement:
      Client.reducers.updateElementData(
        dataId,
        elementData.Name,
        elementData.Data,
        elementData.DataWidth || 128,
        elementData.DataHeight || 128
      );
      break;

    case DataType.ImageElement:
      getBase64(elementData.Data, (result: any) => {
        Client.reducers.updateElementData(dataId, elementData.Name, result.r, result.w, result.h);
      });
      break;

    case DataType.WidgetElement:
      Client.reducers.updateElementData(
        dataId,
        elementData.Name,
        elementData.Data,
        elementData.DataWidth || 128,
        elementData.DataHeight || 128
      );
      break;
  }
};

const getBase64 = (file: any, cb: any) => {
  let reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = function () {
    var image = new Image();
    if (!reader.result) return;
    image.src = reader.result.toString();
    image.onload = function () {
      cb({
        r: reader.result,
        w: image.width,
        h: image.height,
      });
      image.remove();
    };
  };

  reader.onerror = function () {};
};
