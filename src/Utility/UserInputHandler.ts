import { toast } from "react-toastify";
import { insertElement } from "../StDB/Reducers/Insert/insertElement";
import { updateElementTransformNoViewportAdjustment } from "../StDB/Reducers/Update/updateElementTransform";
import { SelectedType } from "../Types/General/SelectedType";
import { GetCoordsFromTransform, GetMatrixFromElement, GetTransformFromCoords } from "./ConvertCoordinates";
import { OffsetElementForCanvas } from "./OffsetElementForCanvas";
import { CompressImage } from "./CompressImage";
import { DebugLogger } from "./DebugLogger";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { handleFlipElement } from "./ContextMenuMethods";
import { DbConnection, ElementStruct, ImageElementData, Layouts } from "../module_bindings";
import { getElementByID } from "../StDB/SpacetimeDBUtils";

let hobbesArmed = false;
let hobbesTimer: number | null = null;
const HOBBES_CHAIN_MS = 4000;

const armHobbes = () => {
  hobbesArmed = true;
  if (hobbesTimer) clearTimeout(hobbesTimer);
  hobbesTimer = window.setTimeout(() => (hobbesArmed = false), HOBBES_CHAIN_MS);
};

const disarmHobbes = () => {
  hobbesArmed = false;
  if (hobbesTimer) {
    clearTimeout(hobbesTimer);
    hobbesTimer = null;
  }
};

export const UserInputHandler = (
  Client: DbConnection,
  activeLayout: Layouts,
  selectedElement: SelectedType | undefined,
  selectoElements: Array<SVGElement | HTMLElement>,
  compressPaste: boolean | undefined,
  transformRef: ReactZoomPanPinchRef | null,
  transformSelect: any,
  setTransformSelect: Function,
  openOwnershipModal: Function
): any => {
  const userInputs = [];

  // GO HOME
  userInputs.push({
    name: "goHome",
    keys: "home",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed HOME");
      event.preventDefault();

      try {
        transformRef?.centerView();
      } catch (error) {
        console.log("Pogly encountered an issue when attempting to Delete an element!");
      }
    },
  });

  // DELETE SELECTED ELEMENT WITH DELETE
  userInputs.push({
    name: "deleteElement",
    keys: "delete",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed DELETE");
      event.preventDefault();

      try {
        DebugLogger("Deleting element");
        selectoElements.forEach((e) => Client.reducers.deleteElement(Number(e.id)));
      } catch (error) {
        console.log("Pogly encountered an issue when attempting to Delete an element!");
      }
    },
  });

  // SHOW SELECTED ELEMENT(S) WITH PAGE UP
  userInputs.push({
    name: "showElement",
    keys: "pageup",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed PAGE UP");
      event.preventDefault();

      try {
        DebugLogger("showing element(s)");
        selectoElements.forEach((e) => Client.reducers.updateElementTransparency(Number(e.id), 100));
      } catch (error) {
        console.log("Pogly encountered an issue when attempting to show an element(s)!");
      }
    },
  });

  // HIDE SELECTED ELEMENT(S) WITH PAGE UP
  userInputs.push({
    name: "hideElement",
    keys: "pagedown",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed PAGE DOWN");
      event.preventDefault();

      try {
        DebugLogger("hiding element(s)");
        selectoElements.forEach((e) => Client.reducers.updateElementTransparency(Number(e.id), 0));
      } catch (error) {
        console.log("Pogly encountered an issue when attempting to hide an element(s)!");
      }
    },
  });

  // CUT SELECTED ELEMENT WITH CTRL + X
  userInputs.push({
    name: "cutElement",
    keys: "ctrl+x",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed CTRL + X");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (element) navigator.clipboard.writeText(JSON.stringify(element));
        DebugLogger("Deleting and copying element");

        Client.reducers.deleteElement(selectedElement.Elements.id);
      } catch {
        console.log("Pogly encountered an issue when attempting to Cut an element!");
      }
    },
  });

  // DUPLICATE ELEMENT WITH CTRL + D
  userInputs.push({
    name: "duplicateElement",
    keys: "ctrl+d",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed CTRL + D");
      event.preventDefault();

      try {
        if (!selectedElement) return;
        DebugLogger("Duplicating element");
        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (element) {
          const matrix = GetMatrixFromElement(element.transform) || undefined;
          const transform = OffsetElementForCanvas(element).transform;

          insertElement(Client, element.element, activeLayout, element.transparency, transform, element.clip, matrix);
        }
      } catch {
        console.log("Pogly encountered an issue when attempting to Duplicate an element!");
      }
    },
  });

  // COPY ELEMENT WITH CTRL + C
  userInputs.push({
    name: "copyElement",
    keys: "ctrl+c",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed CTRL + C");
      event.preventDefault();

      try {
        if (!selectedElement) return;
        DebugLogger("Copying element");
        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (element) navigator.clipboard.writeText(JSON.stringify(element));
      } catch {
        console.log("Pogly encountered an issue when attempting to Copy an element!");
      }
    },
  });

  // PASTE SOMETHING TO CAVNAS WITH CTRL + V
  userInputs.push({
    name: "pasteElement",
    keys: "ctrl+v",
    action: "keydown",
    callback: async (event: any) => {
      DebugLogger("User pressed CTRL + V");
      event.preventDefault();

      try {
        const text = await navigator.clipboard.readText();
        const clipboard = await navigator.clipboard.read();

        for (let i = 0; i < clipboard.length; i++) {
          const isImage = clipboard[i].types.find((element) => element.includes("image"));

          if (isImage) {
            const type = clipboard[i].types.findIndex((t) => t.includes("image"));
            let blob: any = await clipboard[i].getType(clipboard[i].types[type]);

            if (blob.type !== "image/gif" && compressPaste) {
              DebugLogger("Compressing image");
              blob = await CompressImage(blob);
            }

            if (blob.size / 1024 > 150) {
              DebugLogger("Image size too large");
              return toast.error("File size too large to paste. Consider pasting an image URL instead.", {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });
            }

            blobToBase64(blob, (result: { r: any; w: number; h: number }) => {
              DebugLogger("Inserting new element");
              insertElement(
                Client,
                ElementStruct.ImageElement({
                  imageElementData: ImageElementData.RawData(result.r as string),
                  width: result.w,
                  height: result.h,
                }),
                activeLayout
              );
            });
          }
        }

        if (text !== "") {
          try {
            const json = JSON.parse(text);
            if (!json.element.tag) return;

            DebugLogger("Inserting new text");

            const matrix = GetMatrixFromElement(json.transform) || undefined;
            const transform = OffsetElementForCanvas(json).transform;

            insertElement(
              Client,
              json.element as ElementStruct,
              activeLayout,
              json.transparency,
              transform,
              json.clip,
              matrix
            );
          } catch (error) {
            const isImageUrl = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg|webp|avif))/i.test(text);

            if (isImageUrl) {
              const image = new Image();
              image.src = text;

              image.onload = async function () {
                insertElement(
                  Client,
                  ElementStruct.ImageElement({
                    imageElementData: ImageElementData.RawData(text as string),
                    width: image.width,
                    height: image.height,
                  }),
                  activeLayout
                );
              };
              image.remove();
            } else {
              const textElement: ElementStruct = ElementStruct.TextElement({
                text: text,
                size: 72,
                color: "#FFFFFF",
                font: "Roboto",
                css: "",
              });

              insertElement(Client, textElement, activeLayout);
            }
          }
        }
      } catch {
        console.log("Pogly encountered an issue when attempting to Paste an element!");
      }
    },
  });

  // NUDGE ELEMENT - RIGHT ARROW
  userInputs.push({
    name: "nudgeRight",
    keys: "right",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed right arrow");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.x += 2;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // NUDGE ELEMENT W/ SHIFT - RIGHT ARROW
  userInputs.push({
    name: "nudgeRightShift",
    keys: "shift+right",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed SHIFRT + right arrow");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.x += 7;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // NUDGE ELEMENT - LEFT ARROW
  userInputs.push({
    name: "nudgeLeft",
    keys: "left",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed left arrow");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.x -= 2;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // NUDGE ELEMENT W/ SHIFT - LEFT ARROW
  userInputs.push({
    name: "nudgeLeftShift",
    keys: "shift+left",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed SHIFT + left arrow");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.x -= 7;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // NUDGE ELEMENT - UP ARROW
  userInputs.push({
    name: "nudgeUp",
    keys: "up",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed up arrow");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.y -= 2;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // NUDGE ELEMENT W/ SHIFT - UP ARROW
  userInputs.push({
    name: "nudgeUpShift",
    keys: "shift+up",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed SHIFT + up arrow");

      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.y -= 7;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // NUDGE ELEMENT - DOWN ARROW
  userInputs.push({
    name: "nudgeDown",
    keys: "down",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed down arrow");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.y += 2;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // NUDGE ELEMENT W/ SHIFT - UP ARROW
  userInputs.push({
    name: "nudgeDownShift",
    keys: "shift+down",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed SHIFT + down arrow");
      event.preventDefault();

      try {
        if (!selectedElement) return;

        const element = Client.db.elements.id.find(selectedElement.Elements.id);

        if (!element) return;

        DebugLogger("Nudging element");

        let coords = GetCoordsFromTransform(element.transform);
        coords.y += 7;
        const newTransform = GetTransformFromCoords(
          coords.x,
          coords.y,
          coords.rotation,
          coords.rotationAfterX,
          coords.rotationAfterY,
          coords.scaleX,
          coords.scaleY
        );

        updateElementTransformNoViewportAdjustment(Client, element.id, newTransform);

        selectedElement.Component.style.setProperty(
          "transform",
          GetTransformFromCoords(
            coords.x,
            coords.y,
            coords.rotation,
            coords.rotationAfterX,
            coords.rotationAfterY,
            coords.scaleX,
            coords.scaleY
          )
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to Nudge an element!");
      }
    },
  });

  // MOVE CANVAS - UP / W
  userInputs.push({
    name: "canvasUp",
    keys: "w",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed w");
      event.preventDefault();

      try {
        if (!transformRef) return;
        transformRef.instance.setTransformState(
          transformRef.instance.transformState.scale,
          transformRef.instance.transformState.positionX,
          transformRef.instance.transformState.positionY + 15
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to move canvas up!");
      }
    },
  });

  // MOVE CANVAS - DOWN / S
  userInputs.push({
    name: "canvasDown",
    keys: "s",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed s");
      event.preventDefault();

      try {
        if (!transformRef) return;
        transformRef.instance.setTransformState(
          transformRef.instance.transformState.scale,
          transformRef.instance.transformState.positionX,
          transformRef.instance.transformState.positionY - 15
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to move canvas down!");
      }
    },
  });

  // MOVE CANVAS - LEFT / A
  userInputs.push({
    name: "canvasLeft",
    keys: "a",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed a");
      event.preventDefault();

      try {
        if (!transformRef) return;
        transformRef.instance.setTransformState(
          transformRef.instance.transformState.scale,
          transformRef.instance.transformState.positionX + 15,
          transformRef.instance.transformState.positionY
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to move canvas up!");
      }
    },
  });

  // MOVE CANVAS - RIGHT / D
  userInputs.push({
    name: "canvasRight",
    keys: "d",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("User pressed d");
      event.preventDefault();

      try {
        if (!transformRef) return;
        transformRef.instance.setTransformState(
          transformRef.instance.transformState.scale,
          transformRef.instance.transformState.positionX - 15,
          transformRef.instance.transformState.positionY
        );
      } catch {
        console.log("Pogly encountered an issue when attempting to move canvas up!");
      }
    },
  });

  // SPOTLIGHT FEATURE
  userInputs.push({
    name: "spotlight1",
    keys: "ctrl+space",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("user opened spotlight");
      event.preventDefault();

      try {
        DebugLogger("Opening settings modal");
        showSpotlight();
      } catch {
        console.log("Pogly encountered an issue when attempting to move canvas up!");
      }
    },
  });

  // SPOTLIGHT FEATURE (alt hotkey)
  userInputs.push({
    name: "spotlight2",
    keys: "ctrl+k",
    action: "keydown",
    callback: (event: any) => {
      DebugLogger("user opened spotlight");
      event.preventDefault();

      try {
        DebugLogger("Opening settings modal");
        showSpotlight();
      } catch {
        console.log("Pogly encountered an issue when attempting to move canvas up!");
      }
    },
  });

  userInputs.push({
    name: "fliphorizontal",
    keys: "ctrl+f",
    action: "keydown",
    callback: (event: any) => {
      event.preventDefault();

      handleFlipElement(Client, false, selectedElement!.Elements);
    },
  });

  userInputs.push({
    name: "flipvertical",
    keys: "shift+f",
    action: "keydown",
    callback: (event: any) => {
      event.preventDefault();

      handleFlipElement(Client, true, selectedElement!.Elements);
    },
  });

  userInputs.push({
    name: "enablewarp",
    keys: "shift+w",
    action: "keydown",
    callback: (event: any) => {
      event.preventDefault();
      if (transformSelect.warp) return;

      setTransformSelect({
        size: false,
        warp: true,
        clip: false,
      });

      toast.info("Warp transform enabled", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
  });

  userInputs.push({
    name: "enableclip",
    keys: "shift+c",
    action: "keydown",
    callback: (event: any) => {
      event.preventDefault();
      if (transformSelect.clip) return;

      setTransformSelect({
        size: false,
        warp: false,
        clip: true,
      });

      toast.info("Clip transform enabled", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
  });

  userInputs.push({
    name: "enablescale",
    keys: "shift+s",
    action: "keydown",
    callback: (event: any) => {
      event.preventDefault();
      if (transformSelect.size) return;

      if (selectedElement) {
        const element = getElementByID(Client, selectedElement.Elements.id);

        if (element) {
          const hasElementBeenWarped = element.transform.includes("matrix");
          if (hasElementBeenWarped) {
            return toast.error("Warped elements cannot be scaled.", {
              position: "bottom-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
        }
      }

      setTransformSelect({
        size: true,
        warp: false,
        clip: false,
      });

      toast.info("Scale transform enabled", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
  });

  userInputs.push({
    name: "hobbes_part1",
    keys: ["h", "o", "b"],
    action: "keydown",
    callback: (event: KeyboardEvent) => {
      event.preventDefault();
      armHobbes();
    },
  });

  userInputs.push({
    name: "hobbes_part2",
    keys: ["b", "e", "s"],
    action: "keydown",
    callback: (event: KeyboardEvent) => {
      if (!hobbesArmed) return;
      event.preventDefault();
      disarmHobbes();

      insertElement(
        Client,
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.RawData(
            "https://images.steamusercontent.com/ugc/436076195940631339/AF31CA667FA29E51E6D450FB58838C2B4F19C068/" as string
          ),
          width: 500,
          height: 320,
        }),
        activeLayout
      );

      toast.success("In loving memory <3", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
  });

  userInputs.push({
    name: "ownerclaim",
    keys: ["o", "w", "n"],
    action: "keydown",
    callback: (event: KeyboardEvent) => {
      event.preventDefault();
      openOwnershipModal();
    },
  });

  return userInputs;
};

const blobToBase64 = (file: any, cb: any) => {
  DebugLogger("Converting image to Base64");
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

const showSpotlight = () => {
  const modal = document.getElementById("spotlight_modal");
  const seatch = document.getElementById("spotlight_search") as HTMLInputElement;

  const isModalShowing = modal?.style.display ? true : false;

  if (isModalShowing) {
    modal?.style.removeProperty("display");
  } else {
    modal?.style.setProperty("display", "unset");
    seatch.focus();
  }
};
