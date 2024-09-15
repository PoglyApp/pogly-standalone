import AddElementDataArrayReducer from "../../../module_bindings/add_element_data_array_reducer";
import AddElementDataReducer from "../../../module_bindings/add_element_data_reducer";
import DataType from "../../../module_bindings/data_type";
import { ElementDataType } from "../../../Types/General/ElementDataType";
import { DebugLogger } from "../../../Utility/DebugLogger";

export const insertElementData = (elementData: ElementDataType) => {
  DebugLogger("Inserting new element data");

  switch (elementData.DataType) {
    case DataType.TextElement:
      AddElementDataReducer.call(
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
          AddElementDataArrayReducer.call(
            elementData.Name,
            elementData.DataType,
            elementData.Data,
            convertDataURIToBinary(elementData.Data),
            image.width || 128,
            image.height || 128
          );
          image.remove();
        };
      } else {
        getBase64(elementData.Data, (result: { r: any; w: number; h: number }) => {
          const arr = convertDataURIToBinary(result.r);
          AddElementDataArrayReducer.call(elementData.Name, elementData.DataType, result.r, arr, result.w, result.h);

          console.log("base64 => " + new Blob([result.r]).size);
          console.log("binary => " + arr.length)
        });
      }
      break;

    case DataType.WidgetElement:
      AddElementDataReducer.call(
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

const getImageWidthAndHeight = (src: string) => {
  const image = new Image();
  image.src = src;

  image.onload = async function () {};
};

const convertDataURIToBinary = (dataURI: any) => {
  var base64Index = dataURI.indexOf(';base64,') + ';base64,'.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }

  return array;
};