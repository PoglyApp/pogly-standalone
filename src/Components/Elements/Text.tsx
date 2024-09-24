import { useContext, useEffect, useRef } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import Elements from "../../module_bindings/elements";
import TextElement from "../../module_bindings/text_element";
import { TextCreationModal } from "../Modals/TextCreationModal";
import { ApplyCustomFont } from "../../Utility/ApplyCustomFont";
import { DebugLogger } from "../../Utility/DebugLogger";
import Markdown from "react-markdown";
import { ConvertCSSToCanvas } from "../../Utility/ConvertCoordinates";

interface IProp {
  elements: Elements;
}

export const Text = (props: IProp) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const { setModals } = useContext(ModalContext);

  const textElement: TextElement = props.elements.element.value as TextElement;
  const targetRef = useRef<HTMLDivElement>(null);

  const converted = ConvertCSSToCanvas(textElement.css);

  useEffect(() => {
    DebugLogger("Creating text");
    try {
      const fontJSON = JSON.parse(textElement.font);
      ApplyCustomFont(fontJSON, targetRef.current);
    } catch (error) {}
  }, [textElement.font]);

  const showTextCreationModal = () => {
    DebugLogger("Opening text creation modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <TextCreationModal key="textCreation_modal" editElementId={props.elements.id} />,
    ]);
  };

  return (
    <div
      id={props.elements.id.toString()}
      ref={targetRef}
      className="element"
      data-locked={props.elements.locked}
      style={{
        position: "fixed",
        zIndex: props.elements.zIndex,
        color: textElement.color,
        opacity: props.elements.transparency / 100 <= 0.2 && !isOverlay ? 0.2 : props.elements.transparency / 100,
        fontSize: textElement.size,
        transform: props.elements.transform,
        fontFamily: textElement.font,
        backgroundColor: props.elements.transparency / 100 <= 0.2 && !isOverlay ? "rgba(245, 39, 39, 0.8)" : "",
        textShadow: textElement.css ? (!isOverlay ? converted : textElement.css) : "",
      }}
      onDoubleClick={showTextCreationModal}
    >
      <Markdown>{textElement.text}</Markdown>
    </div>
  );
};
