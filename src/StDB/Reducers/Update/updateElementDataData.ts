import { ElementDataType } from "../../../Types/General/ElementDataType";
import DataType from "../../../module_bindings/data_type";
import UpdateElementDataDataReducer from "../../../module_bindings/update_element_data_data_reducer";

export const updateElementDataData = (dataId: number, elementData: ElementDataType) => {
  switch (elementData.DataType) {
    case DataType.TextElement:
      UpdateElementDataDataReducer.call(dataId, elementData.Data);
      break;

    case DataType.ImageElement:
      getBase64(elementData.Data, (result: any) => {
        UpdateElementDataDataReducer.call(dataId, result);
      });
      break;

    case DataType.WidgetElement:
      UpdateElementDataDataReducer.call(dataId, elementData.Data);
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
