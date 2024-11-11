import { LayerElementType } from "@/types/LayerElementType";
import { Image, Type, Code } from "lucide-react";

interface IProps {
  text: string;
  type: LayerElementType;
}

export const LayerElement = (props: IProps) => {
  return (
    <div className="flex" style={{ width: "300px", color: "#edf1ff", marginBottom: "12px" }}>
      {props.type === LayerElementType.Text && <Type />}
      {props.type === LayerElementType.Image && <Image />}
      {props.type === LayerElementType.Widget && <Code />}
      <span className="pl-2">{props.text}</span>
    </div>
  );
};
