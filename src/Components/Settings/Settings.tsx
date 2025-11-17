import styled, { css } from "styled-components";
import { useRef, useState } from "react";
import { StreamPreviewSettings } from "./StreamPreviewSettings";
import { APIKeysSettings } from "./APIKeysSettings";
import { GeneralSettings } from "./GeneralSettings";
import { DataManagementSettings } from "./DataManagementSettings";
import { OwnerSettings } from "./OwnerSettings";
import { OverrideSettings } from "./OverrideSettings";
import { Container } from "../General/Container";
import { Button } from "../NewUiComponents/Button";
import { EditorSettings, EditorSettingsRef } from "./EditorSettings";
import { ChevronLeft, Trash2Icon } from "lucide-react";

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
  const [showSaveFooter, setShowSaveFooter] = useState<boolean>(false);

  const editorRef = useRef<EditorSettingsRef | null>(null);

  return (
    <>
      {visible && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[clamp(320px,80vw,900px)] h-[clamp(420px,75vh,900px)] appear min-w-fit darkScrollbar">
          <Container title="settings" subTitle={selectedCategory.toString()} className="w-full h-full shadow-2xl">
            <div className="flex h-full w-full p-4 gap-3">
              <div className="flex flex-col gap-2 h-full min-w-[180px] bg-[#10121a] rounded-xl p-4 shadow-md overflow-y-auto ">
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

              <div className="flex flex-col h-full w-full">
                <div className="w-full h-full border border-[#10121a] rounded-xl p-3 overflow-auto">
                  <>{selectedCategory === SettingsCategory.General && <GeneralSettings />}</>
                  <>
                    {selectedCategory === SettingsCategory.Editors && (
                      <EditorSettings ref={editorRef} showSaveFooter={setShowSaveFooter} />
                    )}
                  </>
                  <>{selectedCategory === SettingsCategory.StreamPreview && <StreamPreviewSettings />}</>
                  <>{selectedCategory === SettingsCategory.Overrides && <OverrideSettings />}</>
                  <>{selectedCategory === SettingsCategory.APIKeys && <APIKeysSettings />}</>
                  <>{selectedCategory === SettingsCategory.DataManagement && <DataManagementSettings />}</>
                  <>{selectedCategory === SettingsCategory.Owner && <OwnerSettings />}</>
                </div>

                <div className="contents h-fit w-full">
                  {!showSaveFooter ? (
                    <Button
                      className="w-fit self-end mt-3"
                      onClick={() => {
                        setVisible(!visible);
                      }}
                    >
                      close
                    </Button>
                  ) : (
                    <div className="flex">
                      <Button
                        className="w-fit self-end mt-3 bg-transparent!"
                        onClick={() => editorRef.current?.cancel()}
                      >
                        <span className="flex text-gray-400">
                          <ChevronLeft size={21} className="self-center" /> return
                        </span>
                      </Button>
                      <div className="flex ml-auto gap-3">
                        <Button className="w-fit self-end mt-3" onClick={() => editorRef.current?.delete()}>
                          <span className="flex text-[#F0044B]">
                            {" "}
                            <Trash2Icon size={18} className="self-center mr-1" /> delete
                          </span>
                        </Button>
                        <Button className="w-fit self-end mt-3" onClick={() => editorRef.current?.save()}>
                          save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </div>
      )}
    </>
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
