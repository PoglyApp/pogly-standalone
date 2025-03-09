import { useContext, useEffect, useRef, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import { TextCreationModal } from "../Modals/TextCreationModal";
import { ApplyCustomFont } from "../../Utility/ApplyCustomFont";
import { DebugLogger } from "../../Utility/DebugLogger";
import Markdown from "react-markdown";
import remark from "remark-gfm";
import { parseCustomCss } from "../../Utility/ParseCustomCss";
import { Elements, TextElement } from "../../module_bindings";

interface IProp {
  elements: Elements;
}

export const Text = (props: IProp) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const { setModals } = useContext(ModalContext);

  const textElement: TextElement = props.elements.element.value as TextElement;
  const targetRef = useRef<HTMLDivElement>(null);

  const [textShadow, setTextShadow] = useState<string>("");
  const [textOutline, setTextOutline] = useState<string>("");
  const [customCss, setCustomCss] = useState<object>();

  const [fontFamily, setFontFamily] = useState<string>("");

  useEffect(() => {
    if (!textElement.css) return;

    const css = JSON.parse(textElement.css);

    setTextShadow(isOverlay ? css.shadow : css.shadow);
    setTextOutline(isOverlay ? css.outline : css.outline);
    setCustomCss(isOverlay ? parseCustomCss(css.custom) : parseCustomCss(css.custom));
    setFontFamily(textElement.font);
  }, [textElement, isOverlay]);

  useEffect(() => {
    DebugLogger("Creating text");
    try {
      const fontJSON = JSON.parse(textElement.font);
      ApplyCustomFont(fontJSON, targetRef.current);

      setFontFamily(fontJSON.fontFamily);
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
      className="element textElement"
      data-locked={props.elements.locked}
      style={{
        position: "fixed",
        zIndex: props.elements.zIndex,
        color: textElement.color,
        opacity: props.elements.transparency / 100 <= 0.2 && !isOverlay ? 0.2 : props.elements.transparency / 100,
        fontSize: textElement.size,
        transform: props.elements.transform,
        fontFamily: `'${fontFamily}'`,
        backgroundColor: props.elements.transparency / 100 <= 0.2 && !isOverlay ? "rgba(245, 39, 39, 0.8)" : "",
        textShadow: textShadow,
        WebkitTextStroke: textOutline,
        ...customCss,
      }}
      onDoubleClick={showTextCreationModal}
    >
      <Markdown remarkPlugins={[remark]}>{textElement.text}</Markdown>
    </div>
  );
};
