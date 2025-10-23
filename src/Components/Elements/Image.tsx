import { useContext, useEffect, useRef, useState } from "react";
import handleElementBorder from "../../Utility/HandleElementBorder";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { InRenderBounds } from "../../Utility/ConvertCoordinates";
import { convertBinaryToDataURI } from "../../Utility/ImageConversion";
import { ElementData, Elements, ImageElement } from "../../module_bindings";
import { getElementDataByID } from "../../StDB/SpacetimeDBUtils";
import { SpacetimeContextType } from "../../Types/General/SpacetimeContextType";

interface IProp {
  elements: Elements;
}

export const Image = (props: IProp) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const spacetimeDB: SpacetimeContextType = useContext(SpacetimeContext);
  const targetRef = useRef<HTMLDivElement>(null);

  const [imageData, setImageData] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");

  const imageElement = props.elements.element.value as ImageElement;

  useEffect(() => {
    if (!isOverlay) {
      handleElementBorder(spacetimeDB.Client, spacetimeDB.Identity.address, props.elements.id.toString());
    }

    DebugLogger("Creating image");

    if (imageElement.imageElementData.tag === "ElementDataId") {
      const eData: ElementData = getElementDataByID(spacetimeDB.Client, imageElement.imageElementData.value);

      if (!eData) return;

      setImageData(convertBinaryToDataURI(eData));
      setImageName(eData.name);
    } else {
      setImageData(imageElement.imageElementData.value);
      setImageName("RawData");
    }
  }, [
    spacetimeDB.Identity.identity,
    imageElement.imageElementData.tag,
    imageElement.imageElementData.value,
    props.elements.id,
    spacetimeDB.Identity.address,
    spacetimeDB.Client,
  ]);

  const renderDisplay = () => {
    if (InRenderBounds(props.elements)) {
      return "block";
    } else {
      return "none";
    }
  };

  return (
    <div
      className="element"
      id={props.elements.id.toString()}
      ref={targetRef}
      style={{
        width: imageElement.width,
        height: imageElement.height,
        minWidth: "16px",
        minHeight: "16px",
        transform: props.elements.transform,
        opacity: props.elements.transparency / 100 <= 0.2 && !isOverlay ? 0.2 : props.elements.transparency / 100,
        clipPath: props.elements.clip,
        position: "fixed",
        zIndex: props.elements.zIndex,
        backgroundColor: props.elements.transparency / 100 <= 0.2 && !isOverlay ? "rgba(245, 39, 39, 0.8)" : "",
        display: isOverlay ? renderDisplay() : "block",
      }}
      data-locked={props.elements.locked}
    >
      <img src={imageData} alt={imageName} draggable="false" className="imageElement" />
      <p id={"debug-text" + props.elements.id} style={{ color: "white", display: "inline", fontSize: "6px" }}></p>
    </div>
  );
};
