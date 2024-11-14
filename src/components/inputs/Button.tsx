import { Tooltip } from "../general/Tooltip";

interface IProps {
  tooltip: string;
  onclick: Function;
  icon?: any;
  text?: string;
  border?: boolean;
  fontSize?: string;
  fontColor?: string;
  style?: any;
  className?: string;
}

export const Button = (props: IProps) => {
  return (
    <Tooltip text={props.tooltip}>
      <div className={props.className} style={{ color: "#7e828c", ...props.style }} onClick={() => props.onclick()}>
        <button
          className={"text-2xl" + (props.border ? " highlight" : "")}
          style={{
            height: "100%",
            borderStyle: "solid",
            borderRadius: "10px",
            borderWidth: "2px",
            borderColor: "transparent",
            fontSize: props.fontSize,
            color: props.fontColor,
          }}
        >
          {props.icon} {props.text}
        </button>
      </div>
    </Tooltip>
  );
};
