import styled from "styled-components";
import { ChevronDown } from "lucide-react";
import { ChangeEventHandler, PropsWithChildren } from "react";

interface IProps {
  defaultValue?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export const Select = ({ defaultValue, title, disabled, className, onChange, children }: PropsWithChildren<IProps>) => {
  return (
    <div className={className ? "relative " + className : "relative"}>
      {title && <p className="text-sm text-[#aeb4d4]">{title}</p>}
      <div className="flex">
        <StyledSelect onChange={onChange} disabled={disabled}>
          {defaultValue && <option value="select">{defaultValue}</option>}
          {children}
        </StyledSelect>
        <ChevronDown className="pointer-events-none absolute self-center text-gray-400 right-0 mr-3" />
      </div>
    </div>
  );
};

const StyledSelect = styled.select`
  width: 100%;
  appearance: none;
  background-color: #10121a;
  color: #e9eeff;

  padding: 10px;
  border-radius: 7px;

  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: #10121a80;
  }

  & > option {
    background-color: #10121a;
  }

  &:disabled {
    background-color: #10121a80;
    color: #edf1ff21;
    cursor: not-allowed;
  }
`;
