import styled from "styled-components";

interface IProps {
  source: string;
  name: string;
  type: string;
  onclick: Function;
}

export const SpotlightElement = (props: IProps) => {
  return (
    <ElementButton onClick={() => props.onclick()}>
      <ElementImage src={props.source} />
      <TextContainer>
        <span>{props.name.length > 50 ? props.name.substring(0, 40) + "..." : props.name}</span>
        <span style={{ fontSize: "12px", color: "#ffffff63" }}>{props.type}</span>
      </TextContainer>
    </ElementButton>
  );
};

const ElementButton = styled.button`
  background-color: #000b15;
  display: flex;
  align-items: center;

  color: #ffffffa6;
  font-size: 16px;

  padding: 8px;
  width: 100%;

  border: none;

  &:hover {
    background-color: #092036;
  }

  &:focus {
    background-color: #092036;
  }
`;

const ElementImage = styled.img`
  width: 50px;
  height: 50px;
  padding-right: 10px;
`;

const TextContainer = styled.div`
  display: grid;
  justify-items: left;
`;
