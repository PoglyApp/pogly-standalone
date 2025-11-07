import { OffsetElementForCanvas } from "./OffsetElementForCanvas";
import { Elements } from "../module_bindings";
import Text from "@/Pages/Canvas/Components/Elements/Text";
import Image from "@/Pages/Canvas/Components/Elements/Image";
import Widget from "@/Pages/Canvas/Components/Elements/Widget";

export const CreateOffsetElementComponent = (elements: Elements) => {
  const newElement: Elements = OffsetElementForCanvas(elements) as Elements;
  let component;

  switch (elements.element.tag) {
    case "TextElement":
      component = <Text elements={newElement} />;
      break;

    case "ImageElement":
      component = <Image elements={newElement} />;
      break;

    case "WidgetElement":
      component = <Widget elements={newElement} />;

      break;
  }

  return component;
};

export const CreateElementComponent = (element: Elements) => {
  let component;

  switch (element.element.tag) {
    case "TextElement":
      component = <Text elements={element} />;
      break;

    case "ImageElement":
      component = <Image elements={element} />;
      break;

    case "WidgetElement":
      component = <Widget elements={element} />;

      break;
  }

  return component;
};
