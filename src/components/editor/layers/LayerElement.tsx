import { LayerElementType } from "@/types/LayerElementType";
import { Image, Type, Code } from "lucide-react";

interface IProps {
  text: string;
  type: LayerElementType;
}

export const LayerElement = (props: IProps) => {
  return (
    <div className="flex 2xl:w-[500px] xl:w-[400px] lg:w-[300px] md:w-[200px] sm:w-[150px]" 
      style={{ color: "#edf1ff", marginBottom: "12px" }}>
      {props.type === LayerElementType.Text && <Type />}
      {props.type === LayerElementType.Image && <Image />}
      {props.type === LayerElementType.Widget && <Code />}
      <span className="pl-2 2xl:text-xl xl:text-xl lg:text-lg md:text-base sm:text-sm">{props.text}</span>
    </div>
  );
};
