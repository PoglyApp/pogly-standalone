import { Elements, TextElement } from "@/module_bindings";
import { ApplyCustomFont } from "@/Utility/ApplyCustomFont";
import { parseCustomCss } from "@/Utility/ParseCustomCss";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remark from "remark-gfm";

interface IProps {
  elements: Elements;
}

const Text = ({ elements }: IProps) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const urlParams = new URLSearchParams(window.location.search);
  const noMarkdown = urlParams.get("nomarkdown");

  const textElement: TextElement = elements.element.value as TextElement;
  const targetRef = useRef<HTMLDivElement>(null);

  const [textShadow, setTextShadow] = useState<string>("");
  const [textOutline, setTextOutline] = useState<string>("");
  const [customCss, setCustomCss] = useState<object>();

  const [fontFamily, setFontFamily] = useState<string>("");

  useEffect(() => {
    if (!textElement.css) return;

    const css = JSON.parse(textElement.css);

    setTextShadow(css.shadow);
    setTextOutline(css.outline);
    setCustomCss(parseCustomCss(css.custom));
    setFontFamily(textElement.font);
  }, [textElement, isOverlay]);

  useEffect(() => {
    try {
      const fontJSON = JSON.parse(textElement.font);
      ApplyCustomFont(fontJSON, targetRef.current);

      setFontFamily(fontJSON.fontFamily);
    } catch (error) {}
  }, [textElement.font]);

  return (
    <div
      id={elements.id.toString()}
      ref={targetRef}
      className="element textElement"
      data-locked={elements.locked}
      style={{
        position: "fixed",
        zIndex: elements.zIndex,
        color: textElement.color,
        opacity: elements.transparency / 100 <= 0.2 && !isOverlay ? 0.2 : elements.transparency / 100,
        fontSize: textElement.size,
        transform: elements.transform,
        fontFamily: `'${fontFamily}'`,
        backgroundColor: elements.transparency / 100 <= 0.2 && !isOverlay ? "rgba(245, 39, 39, 0.8)" : "",
        textShadow: textShadow,
        WebkitTextStroke: textOutline,
        whiteSpace: "nowrap",
        clipPath: elements.clip,
        ...customCss,
      }}
    >
      {noMarkdown ? <p>{textElement.text}</p> : <Markdown remarkPlugins={[remark]}>{textElement.text}</Markdown>}
    </div>
  );
};

export default Text;
