import styled from "styled-components";

interface IProps {
  defaultValue?: string;
  placeholder?: string;
  label?: any;
  style?: any;
  className?: string;
}

export const TextInput = ({ defaultValue, placeholder, label, style, className }: IProps) => {
  return (
    <div>
      {label && (
        <label className="pr-2" style={{ color: "#edf1ff" }}>
          {label}
        </label>
      )}

      <StyledInput
        className={className}
        style={{
          ...style,
        }}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
};

const StyledInput = styled.input`
  background-color: #10121a;
  color: #edf1ff;
  padding-left: 8px;
  padding-top: 3px;
  padding-bottom: 3px;
  border-width: 2px;
  border-color: transparent;
`;
