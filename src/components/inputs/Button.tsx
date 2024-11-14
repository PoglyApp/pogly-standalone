import { Tooltip } from "../general/Tooltip";

interface IProps {
  tooltip: string;
  icon?: any;
  text?: string;
  border?: boolean;
  style?: any;
  className?: string;
}

export const Button = (props: IProps) => {
  return (
    <Tooltip text={props.tooltip}>
      <div className={props.className} style={{ color: "#7e828c", ...props.style }}>
        <button
          className={"text-2xl" + (props.border ? " highlight" : "")}
          style={{
            height: "100%",
            borderStyle: "solid",
            borderRadius: "10px",
            borderWidth: "2px",
            borderColor: "transparent",
          }}
        >
          {props.icon}
        </button>
      </div>
    </Tooltip>
  );
};
