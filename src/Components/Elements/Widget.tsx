import { useContext, useEffect, useRef, useState } from "react";
import Elements from "../../module_bindings/elements";
import WidgetElement from "../../module_bindings/widget_element";
import { ModalContext } from "../../Contexts/ModalContext";
import { WidgetCreationModal } from "../Modals/WidgetCreationModal";
import { WidgetCodeCompiler } from "../../Utility/WidgetCodeCompiler";

interface IProp {
  elements: Elements;
}

export const Widget = (props: IProp) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const { setModals } = useContext(ModalContext);
  const widgetElement: WidgetElement = props.elements.element.value as WidgetElement;

  const [iframeSrc, setIframeSrc] = useState<string>("");

  useEffect(() => {
    let htmlCode: string = "";

    if (widgetElement.rawData === "") htmlCode = WidgetCodeCompiler(widgetElement.elementDataId);
    else htmlCode = WidgetCodeCompiler(undefined, widgetElement.rawData);

    setIframeSrc("data:text/html;charset=utf-8," + encodeURIComponent(htmlCode));
  }, [widgetElement.elementDataId, widgetElement.rawData]);

  const showWidgetCreationModal = () => {
    setModals((oldModals: any) => [
      ...oldModals,
      <WidgetCreationModal key="widgetCreation_modal" editElementDataId={widgetElement.elementDataId} />,
    ]);
  };

  return (
    <div
      id={props.elements.id.toString()}
      className="element"
      data-locked={props.elements.locked}
      style={{
        width: widgetElement.width,
        height: widgetElement.height,
        transform: props.elements.transform,
        opacity: props.elements.transparency / 100 <= 0.2 && !isOverlay ? 0.2 : props.elements.transparency / 100,
        clipPath: props.elements.clip,
        position: "fixed",
        zIndex: props.elements.zIndex,
        overflow: "hidden",
        backgroundColor: props.elements.transparency / 100 <= 0.2 && !isOverlay ? "rgba(245, 39, 39, 0.8)" : "",
      }}
      onDoubleClick={showWidgetCreationModal}
    >
      <iframe
        src={iframeSrc}
        style={{ pointerEvents: "none", border: "none", overflow: "hidden" }}
        scrolling="no"
        width="100%"
        height="100%"
        data-widget-element-data-id={widgetElement.rawData === "" ? widgetElement.elementDataId : -1}
        title="widget"
      />
    </div>
  );
};
