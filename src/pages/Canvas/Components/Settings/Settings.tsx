import styled, { css } from "styled-components";
import { Container } from "../../../../Components/General/Container";
import { useState } from "react";
import { StreamPreviewSettings } from "./StreamPreviewSettings";
import { APIKeysSettings } from "./APIKeysSettings";
import { GeneralSettings } from "./GeneralSettings";
import { DataManagementSettings } from "./DataManagementSettings";
import { OwnerSettings } from "./OwnerSettings";
import { OverrideSettings } from "./OverrideSettings";
import { Button } from "@/Components/Inputs/Button";

enum SettingsCategory {
  General = "general",
  Editors = "editors",
  StreamPreview = "stream preview",
  Overrides = "overrides",
  Keybinds = "keybinds",
  APIKeys = "api keys",
  DataManagement = "data management",
  Owner = "owner",
}

const categories = Object.values(SettingsCategory);

interface IProps {
  visible: boolean;
  setVisible: Function;
}

export const Settings = ({ visible, setVisible }: IProps) => {
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>(SettingsCategory.General);

  return (
    <div>
      {visible && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[clamp(320px,80vw,900px)] h-[clamp(420px,75vh,900px)] appear min-w-fit">
          <Container title="settings" subTitle={selectedCategory.toString()} className="w-full h-full shadow-md">
            <div className="flex h-full w-full p-4 gap-3">
              <div className="flex flex-col gap-2 h-full min-w-[180px] bg-[#10121a] rounded-xl p-4 shadow-md overflow-y-scroll ">
                {categories.map((label) => (
                  <CategoryButton
                    key={label}
                    selected={selectedCategory === label}
                    onClick={() => setSelectedCategory(label as SettingsCategory)}
                  >
                    {label}
                  </CategoryButton>
                ))}
              </div>

              <div className="w-full border border-[#10121a] rounded-xl p-3">
                <div>{selectedCategory === SettingsCategory.General && <GeneralSettings />}</div>
                <div>{selectedCategory === SettingsCategory.StreamPreview && <StreamPreviewSettings />}</div>
                <div>{selectedCategory === SettingsCategory.Overrides && <OverrideSettings />}</div>
                <div>{selectedCategory === SettingsCategory.APIKeys && <APIKeysSettings />}</div>
                <div>{selectedCategory === SettingsCategory.DataManagement && <DataManagementSettings />}</div>
                <div>{selectedCategory === SettingsCategory.Owner && <OwnerSettings />}</div>

                <Button
                  className="absolute bottom-0 right-0 mr-8"
                  onClick={() => {
                    setVisible(!visible);
                  }}
                >
                  close
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
};

const CategoryButton = styled.button<{ selected: boolean }>`
  cursor: pointer;

  width: 100%;
  text-align: left;

  border: solid 1px transparent;
  border-radius: 6px;

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
