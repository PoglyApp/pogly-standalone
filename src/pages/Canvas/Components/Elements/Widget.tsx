import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { Elements, WidgetElement } from "@/module_bindings";
import { InRenderBounds } from "@/Utility/ConvertCoordinates";
import { WidgetCodeCompiler } from "@/Utility/WidgetCodeCompiler";
import { useContext, useEffect, useState } from "react";

interface IProps {
  elements: Elements;
}

const Widget = ({ elements }: IProps) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const { spacetimeDB } = useContext(SpacetimeContext);

  const widgetElement: WidgetElement = elements.element.value as WidgetElement;

  const [iframeSrc, setIframeSrc] = useState<string>("");

  useEffect(() => {
    try {
      let htmlCode: string = "";

      if (widgetElement.rawData === "")
        htmlCode = WidgetCodeCompiler(
          spacetimeDB.Client,
          widgetElement.width,
          widgetElement.height,
          widgetElement.elementDataId
        );
      else
        htmlCode = WidgetCodeCompiler(
          spacetimeDB.Client,
          widgetElement.width,
          widgetElement.height,
          undefined,
          widgetElement.rawData
        );

      setIframeSrc(htmlCode);
    } catch (error) {
      console.log("ERROR WHILE SPAWNING WIDGET", error);
    }
  }, [widgetElement.elementDataId, widgetElement.rawData, widgetElement.width, widgetElement.height]);

  const renderDisplay = () => {
    if (InRenderBounds(elements)) {
      return "block";
    } else {
      return "none";
    }
  };

  return (
    <div
      id={elements.id.toString()}
      className="element"
      data-locked={elements.locked}
      style={{
        width: widgetElement.width,
        height: widgetElement.height,
        transform: elements.transform,
        opacity: elements.transparency / 100 <= 0.2 && !isOverlay ? 0.2 : elements.transparency / 100,
        clipPath: elements.clip,
        position: "fixed",
        zIndex: elements.zIndex,
        overflow: "hidden",
        backgroundColor: elements.transparency / 100 <= 0.2 && !isOverlay ? "rgba(245, 39, 39, 0.8)" : "",
        display: isOverlay ? renderDisplay() : "block",
      }}
    >
      <iframe
        srcDoc={iframeSrc}
        style={{ pointerEvents: "none", border: "none", overflow: "hidden" }}
        scrolling="no"
        width="100%"
        height="100%"
        data-widget-element-data-id={widgetElement.elementDataId}
        title="widget"
      />
    </div>
  );
};

export default Widget;
