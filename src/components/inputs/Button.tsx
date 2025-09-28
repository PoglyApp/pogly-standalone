import { MouseEventHandler, PropsWithChildren } from "react";
import styled from "styled-components";

interface IProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}

export const Button = ({ onClick, disabled, className, children }: PropsWithChildren<IProps>) => {
  return (
    <StyledButton className={className} disabled={disabled} onClick={onClick}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button`
  background-color: #10121a;
  color: #edf1ff;

  padding: 10px 15px 10px 15px;
  border-radius: 7px;

  margin-left: 5px;

  cursor: pointer;

  &:hover {
    background-color: #10121a80;
  }

  &:disabled {
    background-color: #10121a80;
    color: #edf1ff21;

    cursor: not-allowed;
  }
`;
