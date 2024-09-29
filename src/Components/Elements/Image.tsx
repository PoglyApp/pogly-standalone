import { useEffect, useRef, useState } from "react";
import handleElementBorder from "../../Utility/HandleElementBorder";
import ElementData from "../../module_bindings/element_data";
import Elements from "../../module_bindings/elements";
import ImageElement from "../../module_bindings/image_element";
import { useAppSelector } from "../../Store/Features/store";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { InRenderBounds } from "../../Utility/ConvertCoordinates";
import { convertBinaryToDataURI } from "../../Utility/ImageConversion";

interface IProp {
  elements: Elements;
}

export const Image = (props: IProp) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const { Identity } = useSpacetimeContext();
  const targetRef = useRef<HTMLDivElement>(null);

  const [imageData, setImageData] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");

  const imageElement = props.elements.element.value as ImageElement;
  const elementData: ElementData[] = useAppSelector((state: any) => state.elementData.elementData);

  useEffect(() => {
    handleElementBorder(Identity.address, props.elements.id.toString());
    DebugLogger("Creating image");

    if (imageElement.imageElementData.tag === "ElementDataId") {
      const eData: ElementData = elementData.filter((e) => e.id === imageElement.imageElementData.value)[0];

      if (!eData) return;

      setImageData(convertBinaryToDataURI(eData));
      setImageName(eData.name);
    } else {
      setImageData(imageElement.imageElementData.value);
      setImageName("RawData");
    }
  }, [
    elementData,
    Identity.identity,
    imageElement.imageElementData.tag,
    imageElement.imageElementData.value,
    props.elements.id,
    Identity.address
  ]);

  const renderDisplay = () => {
    if(InRenderBounds(props.elements)) {
      return "block";
    }
    else {
      return "none";
    }
  }

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
      <img src={imageData} alt={imageName} draggable="false" width={"100%"} height={"100%"} />
      <p id={"debug-text" + props.elements.id} style={{ color: "white", display: "inline", fontSize: "6px" }}></p>
    </div>
  );
};
