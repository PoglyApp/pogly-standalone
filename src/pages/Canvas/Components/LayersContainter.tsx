import styled from "styled-components";
import { Container } from "@/Components/General/Container";
import ImageIcon from "@/Assets/Icons/ImageIcon.svg";

export const LayersContainer = () => {
  return (
    <Container title="layers" className="w-[320px] h-[70px] mt-[50px] ml-[40px]">
      <LayerElement>
        <ElementIcon src={ImageIcon} alt="ImageIcon" /> Image element
      </LayerElement>
    </Container>
  );
};

const LayerElement = styled.div`
  display: flex;
  align-items: center;

  width: 288px;
  height: 34px;

  border: solid 1px transparent;
  border-radius: 4px;

  gap: 5px;
  padding-left: 8px;

  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: #82a5ff4d;
    border: solid 1px #82a5ff;
  }
`;

const ElementIcon = styled.img`
  width: 12px;
  height: 12px;
`;
