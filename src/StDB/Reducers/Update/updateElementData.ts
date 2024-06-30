import { ElementDataType } from "../../../Types/General/ElementDataType";
import DataType from "../../../module_bindings/data_type";
import UpdateElementDataReducer from "../../../module_bindings/update_element_data_reducer";

export const updateElementData = (dataId: number, elementData: ElementDataType) => {
  switch (elementData.DataType) {
    case DataType.TextElement:
      UpdateElementDataReducer.call(
        dataId,
        elementData.Name,
        elementData.Data,
        elementData.DataWidth || 128,
        elementData.DataHeight || 128
      );
      break;

    case DataType.ImageElement:
      getBase64(elementData.Data, (result: any) => {
        UpdateElementDataReducer.call(dataId, elementData.Name, result.r, result.w, result.h);
      });
      break;

    case DataType.WidgetElement:
      UpdateElementDataReducer.call(
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
