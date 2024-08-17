import DeleteElementReducer from "../module_bindings/delete_element_reducer";
import ElementStruct from "../module_bindings/element_struct";
import ImageElementData from "../module_bindings/image_element_data";
import Layouts from "../module_bindings/layouts";
import { insertElement } from "../StDB/Reducers/Insert/insertElement";
import { SelectedType } from "../Types/General/SelectedType";
import { ViewportToStdbFontSize } from "./ConvertCoordinates";
import { getTransformValues } from "./GetTransformValues";

export const UserInputHandler = (activeLayout: Layouts, selectedElement: SelectedType | undefined): any => {
  const userInputs = [];

  // DELETE SELECTED ELEMENT WITH DELETE
  userInputs.push({
    name: "deleteElement",
    keys: "delete",
    action: "keydown",
    callback: (event: any) => {
      event!.preventDefault();

      if (!selectedElement) return;

      DeleteElementReducer.call(selectedElement.Elements.id);
    },
  });

  // DELETE SELECTED ELEMENT WITH CTRL + X
  userInputs.push({
    name: "deleteElement",
    keys: "ctrl+x",
    action: "keydown",
    callback: (event: any) => {
      event!.preventDefault();

      if (!selectedElement) return;

      DeleteElementReducer.call(selectedElement.Elements.id);
    },
  });

  // DUPLICATE ELEMENT WITH CTRL + D
  userInputs.push({
    name: "duplicateElement",
    keys: "ctrl+d",
    action: "keydown",
    callback: (event: any) => {
      event!.preventDefault();

      if (!selectedElement) return;

      insertElement(selectedElement.Elements.element, activeLayout);
    },
  });

  // COPY ELEMENT WITH CTRL + C
  userInputs.push({
    name: "copyElement",
    keys: "ctrl+c",
    action: "keydown",
    callback: (event: any) => {
      event!.preventDefault();

      if (!selectedElement) return;

      navigator.clipboard.writeText(JSON.stringify(selectedElement.Elements));
    },
  });

  // PASTE SOMETHING TO CAVNAS WITH CTRL + V
  userInputs.push({
    name: "pasteElement",
    keys: "ctrl+v",
    action: "keydown",
    callback: async (event: any) => {
      event!.preventDefault();

      const text = await navigator.clipboard.readText();
      const clipboard = await navigator.clipboard.read();

      for (let i = 0; i < clipboard.length; i++) {
        const isImage = clipboard[i].types.find((element) => element.includes("image"));

        if (isImage) {
          const blob = await clipboard[i].getType(clipboard[i].types[1]);
          const base64 = await blobToBase64(blob);

          insertElement(
            ElementStruct.ImageElement({
              imageElementData: ImageElementData.RawData(base64 as string),
              width: 512,
              height: 512,
            }),
            activeLayout
          );
        }
      }

      if (text !== "") {
        try {
          const json = JSON.parse(text);
          if (!json.element.tag) return;

          insertElement(json.element as ElementStruct, activeLayout);
        } catch (error) {
          const textElement: ElementStruct = ElementStruct.TextElement({
            text: text,
            size: ViewportToStdbFontSize(12).fontSize,
            color: "#FFFFFF",
            font: "Roboto",
          });

          insertElement(textElement, activeLayout);
        }
      }
    },
  });

  // NUDGE ELEMENT TO RIGHT RIGHT RIGHT ARROW
  userInputs.push({
    name: "nudgeRight",
    keys: "right",
    action: "keydown",
    callback: (event: any) => {
      event!.preventDefault();

      if (!selectedElement) return;

      const transformValues = getTransformValues(selectedElement.Elements.transform);
      console.log(transformValues);
    },
  });

  return userInputs;
};

const blobToBase64 = (blob: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(blob);

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;
  });
};
