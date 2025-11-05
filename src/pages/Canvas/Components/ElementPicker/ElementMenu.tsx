import { useState } from "react";
import styled from "styled-components";
import ImageIcon from "@/Assets/Icons/ImagePickIcon.svg";
import { ElementDataPicker } from "./ElementDataPicker";
import { TextCreator } from "./TextCreator";

export const ElementPicker = () => {
  const [elementDataMenu, setElementDataMenu] = useState<boolean>(false);
  const [textCreatorMenu, setTextCreatorMenu] = useState<boolean>(false);

  return (
    <div className="grid">
      {elementDataMenu && <ElementDataPicker />}
      {textCreatorMenu && <TextCreator />}

      <div className="w-fit p-[13px] bg-[#1E212B] rounded-lg">
        <div className="flex gap-2.5 h-fit">
          <PickerButton
            onClick={() => {
              setElementDataMenu(!elementDataMenu);
              setTextCreatorMenu(false);
            }}
          >
            <PickerButtonIcon src={ImageIcon} alt="Images" />
          </PickerButton>

          <PickerButton
            className="w-[32px] h-[32px]"
            onClick={() => {
              setTextCreatorMenu(!textCreatorMenu);
              setElementDataMenu(false);
            }}
          >
            <span className="text-3xl h-fit text-[#717b97]">T</span>
          </PickerButton>
        </div>
      </div>
    </div>
  );
};

const PickerButton = styled.button`
  cursor: pointer;

  border: solid 1px transparent;
  border-radius: 4px;

  &:hover {
    background-color: #82a5ff4d;
    border: solid 1px #82a5ff;
  }
`;

const PickerButtonIcon = styled.img`
  width: 32px;
  height: 32px;
`;
