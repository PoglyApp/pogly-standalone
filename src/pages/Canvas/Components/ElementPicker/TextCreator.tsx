import styled, { css } from "styled-components";
import { Checkbox } from "@/Components/Inputs/Checkbox";
import { MarkdownEditor } from "@/Components/Inputs/MarkdownEditor";
import { Select } from "@/Components/Inputs/Select";
import { TextInput } from "@/Components/Inputs/TextInput";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";

enum SettingMenu {
  Text,
  Font,
  Shadows,
  Custom,
}

export const TextCreator = () => {
  const [settingsMenu, setSettingsMenu] = useState<SettingMenu>(SettingMenu.Text);

  const [text, setText] = useState<string>("");
  const [useCustomFont, setUseCustomFont] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>("");

  const [useShadow, setUseShadow] = useState<boolean>(false);
  const [useOutline, setUseOutline] = useState<boolean>(false);

  const [showTextColorPicker, setShowTextColorPicker] = useState<boolean>(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState<boolean>(false);
  const [showOutlineColorPicker, setShowOutlineColorPicker] = useState<boolean>(false);

  return (
    <div className="absolute justify-self-center bottom-20 w-[485px] h-[500px] bg-[#1e212b] rounded-[8px] appear">
      <div className="flex pt-4 pl-4 gap-2 w-full">
        <CategoryButton selected={settingsMenu === SettingMenu.Text} onClick={() => setSettingsMenu(SettingMenu.Text)}>
          text
        </CategoryButton>
        <CategoryButton selected={settingsMenu === SettingMenu.Font} onClick={() => setSettingsMenu(SettingMenu.Font)}>
          font
        </CategoryButton>
        <CategoryButton
          selected={settingsMenu === SettingMenu.Shadows}
          onClick={() => setSettingsMenu(SettingMenu.Shadows)}
        >
          shadows
        </CategoryButton>
        <CategoryButton
          selected={settingsMenu === SettingMenu.Custom}
          onClick={() => setSettingsMenu(SettingMenu.Custom)}
        >
          custom css
        </CategoryButton>
      </div>

      {settingsMenu === SettingMenu.Text && <MarkdownEditor text={text} setText={setText} />}

      {settingsMenu === SettingMenu.Font && (
        <div className="flex flex-col pl-4 pt-4">
          <p className="text-sm text-[#aeb4d4]">font</p>
          {useCustomFont ? (
            <TextInput placeholder="font cdn" inputClassName="h-[44px] w-[160px]! mb-1" onChange={() => {}} />
          ) : (
            <Select onChange={() => {}} className="w-[160px] h-[48px]">
              <option value="roboto">roboto</option>
              <option value="tiny5">tiny5</option>
              <option value="lato">lato</option>
              <option value="ubuntu">ubuntu</option>
              <option value="merriweather">merriweather</option>
              <option value="bebas neue">bebas neue</option>
              <option value="anton">anton</option>
            </Select>
          )}
          <Checkbox
            className="mt-1"
            label="use custom font"
            checked={useCustomFont}
            onChange={() => setUseCustomFont(!useCustomFont)}
          />

          <div className="mt-3">
            <p className="text-sm text-[#aeb4d4]">font size</p>
            <TextInput placeholder="72px" inputClassName="h-[44px] w-[160px]!" onChange={() => {}} />
          </div>

          <div className="mt-3 w-full">
            <p className="text-sm text-[#aeb4d4]">font color</p>
            <div className="flex gap-2 mt-1 items-center">
              <ColorBox
                color={textColor}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                style={{ backgroundColor: textColor }}
              />
              <TextInput placeholder="#FFFFFF" inputClassName="h-[44px] w-[160px]!" onChange={() => {}} />
              {showTextColorPicker && (
                <Popover>
                  <Cover onClick={() => setShowTextColorPicker(!showTextColorPicker)} />
                  <HexColorPicker color={textColor} onChange={(color) => {}} />
                </Popover>
              )}
            </div>
          </div>
        </div>
      )}

      {settingsMenu === SettingMenu.Shadows && (
        <div className="flex flex-col pl-4 pt-4 gap-1">
          <Checkbox
            className="mt-1"
            label="text shadow"
            checked={useShadow}
            onChange={() => setUseShadow(!useShadow)}
          />
          {useShadow && (
            <div className="flex gap-2 mt-1 items-center">
              <ColorBox
                color={textColor}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                style={{ backgroundColor: textColor }}
              />
              <TextInput placeholder="#FFFFFF" inputClassName="h-[44px] w-[160px]!" onChange={() => {}} />
              <div className="flex gap-3 absolute right-[65px] top-[83px]">
                <TextInput title="width" placeholder="" inputClassName="h-[44px] w-[50px]!" onChange={() => {}} />
                <TextInput title="height" placeholder="" inputClassName="h-[44px] w-[50px]!" onChange={() => {}} />
                <TextInput title="blur" placeholder="" inputClassName="h-[44px] w-[50px]!" onChange={() => {}} />
              </div>
              {showTextColorPicker && (
                <Popover>
                  <Cover onClick={() => setUseOutline(!useOutline)} />
                  <HexColorPicker color={textColor} onChange={(color) => {}} />
                </Popover>
              )}
            </div>
          )}
          <Checkbox
            className="mt-3"
            label="text outline"
            checked={useOutline}
            onChange={() => setUseOutline(!useOutline)}
          />
          {useOutline && (
            <div className="flex gap-2 mt-1 items-center">
              <ColorBox
                color={textColor}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                style={{ backgroundColor: textColor }}
              />
              <TextInput placeholder="#FFFFFF" inputClassName="h-[44px] w-[160px]!" onChange={() => {}} />
              <div className="flex gap-3 absolute right-[190px] top-[175px]">
                <TextInput title="size" placeholder="" inputClassName="h-[44px] w-[50px]!" onChange={() => {}} />
              </div>
              {showTextColorPicker && (
                <Popover>
                  <Cover onClick={() => setUseOutline(!useOutline)} />
                  <HexColorPicker color={textColor} onChange={(color) => {}} />
                </Popover>
              )}
            </div>
          )}
        </div>
      )}

      {settingsMenu === SettingMenu.Custom && (
        <div className="flex flex-col pl-4 pt-4 gap-1">
          <p className="text-sm text-[#aeb4d4]">soon :)</p>
        </div>
      )}
    </div>
  );
};

const CategoryButton = styled.button<{ selected: boolean }>`
  cursor: pointer;

  border: solid 1px transparent;
  border-radius: 4px;

  font-size: 14px;
  padding: 6px 10px;

  background-color: ${(props) => props.selected && "#82a5ff4d"};
  border: ${(props) => props.selected && "solid 1px #82a5ff"};

  &:hover {
    ${(props) =>
      !props.selected &&
      css`
        background-color: #82a5ff1c;
        border: solid 1px #82a5ff78;
      `}
  }
`;

const ColorBox = styled.div`
  min-width: 50px;
  height: 50px;
  border: 2px solid #ffffffa6;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
  left: 80px;
  bottom: 0px;
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;
