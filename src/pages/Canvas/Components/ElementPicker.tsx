import styled from "styled-components";
import ImageIcon from "@/Assets/Icons/ImagePickIcon.svg";

export const ElementPicker = () => {
  return (
    <div className="w-fit p-[13px] bg-[#1E212B] rounded-lg">
      <div className="flex gap-2.5 h-fit">
        <Button>
          <ButtonIcon src={ImageIcon} alt="Images" />
        </Button>

        <Button className="w-[32px] h-[32px]">
          <span className="text-3xl h-fit text-[#717b97]">T</span>
        </Button>
      </div>
    </div>
  );
};

const Button = styled.button`
  cursor: pointer;

  border: solid 1px transparent;
  border-radius: 4px;

  &:hover {
    background-color: #82a5ff4d;
    border: solid 1px #82a5ff;
  }
`;

const ButtonIcon = styled.img`
  width: 32px;
  height: 32px;
`;
