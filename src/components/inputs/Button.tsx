import styled from "styled-components";
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

export const Button = ({ tooltip, onclick, icon, text, border, fontSize, fontColor, style, className }: IProps) => {
  return (
    <Tooltip text={tooltip}>
      <div className={className} style={{ color: "#7e828c", ...style }} onClick={() => onclick()}>
        <StyledButton
          className={"text-2xl" + (border ? " highlight" : "")}
          style={{
            fontSize: fontSize,
            color: fontColor,
          }}
        >
          {icon} {text}
        </StyledButton>
      </div>
    </Tooltip>
  );
};

const StyledButton = styled.button`
  height: 100%;
  border-style: solid;
  border-radius: 10px;
  border-width: 2px;
  border-color: transparent;
`;
