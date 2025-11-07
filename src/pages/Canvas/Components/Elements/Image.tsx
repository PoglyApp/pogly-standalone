import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { ElementData, Elements, ImageElement } from "@/module_bindings";
import { getElementDataByID } from "@/StDB/SpacetimeDBUtils";
import { InRenderBounds } from "@/Utility/ConvertCoordinates";
import handleElementBorder from "@/Utility/HandleElementBorder";
import { convertBinaryToDataURI } from "@/Utility/ImageConversion";
import { useContext, useEffect, useRef, useState } from "react";

interface IProps {
  elements: Elements;
}

const Image = ({ elements }: IProps) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const { spacetimeDB } = useContext(SpacetimeContext);
  const targetRef = useRef<HTMLDivElement>(null);

  const [imageData, setImageData] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");

  const imageElement: ImageElement = elements.element.value as ImageElement;

  useEffect(() => {
    if (!isOverlay) handleElementBorder(spacetimeDB.Client, spacetimeDB.Client.connectionId, elements.id.toString());

    if (imageElement.imageElementData.tag === "ElementDataId") {
      const eData: ElementData = getElementDataByID(spacetimeDB.Client, imageElement.imageElementData.value);

      if (!eData) return;

      setImageData(convertBinaryToDataURI(eData));
      setImageName(eData.name);
    } else {
      setImageData(imageElement.imageElementData.value);
      setImageName("RawData");
    }
  }, [elements.id, spacetimeDB.Client.connectionId, spacetimeDB.Client]);

  const renderDisplay = () => {
    if (InRenderBounds(elements)) {
      return "block";
    } else {
      return "none";
    }
  };

  return (
    <div
      className="element"
      id={elements.id.toString()}
      ref={targetRef}
      style={{
        width: imageElement.width,
        height: imageElement.height,
        minWidth: "16px",
        minHeight: "16px",
        transform: elements.transform,
        opacity: elements.transparency / 100 <= 0.2 && !isOverlay ? 0.2 : elements.transparency / 100,
        clipPath: elements.clip,
        position: "fixed",
        zIndex: elements.zIndex,
        backgroundColor: elements.transparency / 100 <= 0.2 && !isOverlay ? "rgba(245, 39, 39, 0.8)" : "",
        display: isOverlay ? renderDisplay() : "block",
      }}
      data-locked={elements.locked}
    >
      <img src={imageData} alt={imageName} draggable="false" className="imageElement" />
    </div>
  );
};

export default Image;
