import { DataType, DbConnection } from "../../../module_bindings";
import { ElementDataType } from "../../../Types/General/ElementDataType";
import { DebugLogger } from "../../../Utility/DebugLogger";
import { convertDataURIToBinary } from "../../../Utility/ImageConversion";

export const insertElementData = (Client: DbConnection, elementData: ElementDataType) => {
  DebugLogger("Inserting new element data");

  switch (elementData.DataType) {
    case DataType.TextElement:
      Client.reducers.addElementData(
        elementData.Name,
        elementData.DataType,
        elementData.Data,
        elementData.DataWidth || 128,
        elementData.DataHeight || 128
      );
      break;

    case DataType.ImageElement:
      if (typeof elementData.Data === "string") {
        const image = new Image();
        image.src = elementData.Data;

        image.onload = async function () {
          Client.reducers.addElementData(
            elementData.Name,
            elementData.DataType,
            elementData.Data,
            image.width || 128,
            image.height || 128
          );
          image.remove();
        };
      } else {
        getBase64(elementData.Data, (result: { r: any; w: number; h: number }) => {
          const arr = convertDataURIToBinary(result.r);
          Client.reducers.addElementDataArray(elementData.Name, elementData.DataType, "", arr, result.w, result.h);
        });
      }
      break;

    case DataType.WidgetElement:
      Client.reducers.addElementData(
        elementData.Name,
        elementData.DataType,
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

  reader.onerror = function (error) {
    console.log("Error uploading Image to Pogly: ", error);
  };
};