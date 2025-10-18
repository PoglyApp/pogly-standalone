import styled, { css } from "styled-components";
import ImageIcon from "@/Assets/Icons/ImagePickIcon.svg";
import { useContext, useEffect, useState } from "react";
import { TextInput } from "@/Components/Inputs/TextInput";
import { Button } from "@/Components/Inputs/Button";
import { ElementData, Folders } from "@/module_bindings";
import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { useChannelEmotes } from "@/Hooks/useChannelEmotes";
import SevenTVEmote from "@/Types/SevenTVTypes/SevenTVEmoteType";
import BetterTVEmote from "@/Types/BetterTVTypes/BetterTVEmoteType";
import { FolderPlusIcon, ImagePlayIcon } from "lucide-react";

import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";

enum Category {
  Images,
  Emotes,
  Widgets,
}

export const ElementPicker = () => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.Images);

  const [images, setImages] = useState<ElementData[]>([]);
  const [folders, setFolders] = useState<Folders[]>([]);
  const [sevenTVEmotes, setSevenTVEmotes] = useState<SevenTVEmote[] | null>(null);
  const [betterTVEmotes, setBetterTVEmotes] = useState<BetterTVEmote[] | null>(null);
  const [widgets, setWidgets] = useState<ElementData[]>([]);

  const [showFolderNameInput, setShowFolderInput] = useState<boolean>(false);
  const [folderNameInput, setFolderNameInput] = useState<string>();

  useChannelEmotes(setSevenTVEmotes, setBetterTVEmotes);

  useEffect(() => {
    if (!spacetimeDB) return;

    const elementData: ElementData[] = Array.from(spacetimeDB.Client.db.elementData.iter());
    const imageFolders: Folders[] = Array.from(spacetimeDB.Client.db.folders.iter());

    setImages(elementData.filter((data: ElementData) => data.dataType.tag === "ImageElement"));
    setWidgets(elementData.filter((data: ElementData) => data.dataType.tag === "WidgetElement"));
    setFolders(imageFolders);
  }, [spacetimeDB]);

  const changeCategory = (category: Category) => {
    if (selectedCategory === category) return;

    setSelectedCategory(category);
    setShowFolderInput(false);
  };

  const addNewFolder = () => {
    if (!folderNameInput || folderNameInput.length === 0) return;
    spacetimeDB.Client.reducers.addFolder(folderNameInput);
    setShowFolderInput(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const elementDataID = active.id.toString().replace("_IMAGE_DATA", "");
    const folderID = over.id.toString().replace("_IMAGE_FOLDER", "");

    spacetimeDB.Client.reducers.updateElementDataFolder(elementDataID, folderID);
  };

  return (
    <div className="grid">
      {menuOpen && (
        <div className="absolute justify-self-center bottom-20 w-[485px] h-[500px] bg-[#1e212b] rounded-[8px] overflow-hidden flex flex-col appear">
          <div className="flex pt-4 pl-4 gap-2">
            <CategoryButton
              selected={selectedCategory === Category.Images}
              onClick={() => changeCategory(Category.Images)}
            >
              images
            </CategoryButton>
            <CategoryButton
              selected={selectedCategory === Category.Emotes}
              onClick={() => changeCategory(Category.Emotes)}
            >
              emotes
            </CategoryButton>
            <CategoryButton
              selected={selectedCategory === Category.Widgets}
              onClick={() => changeCategory(Category.Widgets)}
            >
              widgets
            </CategoryButton>
          </div>

          <div className="flex mt-3 ml-4 mr-4">
            <TextInput placeholder="search..." onChange={() => {}} inputClassName="h-[37px] text-[14px]" />
            {selectedCategory === Category.Images && (
              <>
                <Button onClick={() => setShowFolderInput(!showFolderNameInput)} className="w-fit h-[37px] text-[14px]">
                  <FolderPlusIcon className="w-[20px] h-[20px]" />
                </Button>
                <Button onClick={() => {}} className="w-fit h-[37px] text-[14px]">
                  <ImagePlayIcon className="w-[20px] h-[20px]" />
                </Button>
              </>
            )}
          </div>

          {showFolderNameInput && (
            <div className="flex mt-3 ml-4 mr-4">
              <TextInput
                placeholder="folder name"
                onChange={(event) => setFolderNameInput(event.target.value)}
                value={folderNameInput}
                inputClassName="h-[37px] text-[14px]"
              />
              <Button
                onClick={addNewFolder}
                className="w-fit h-[37px] text-[14px]"
                disabled={!folderNameInput || folderNameInput.length === 0}
              >
                create
              </Button>
            </div>
          )}

          <div className="h-full w-full mt-2 border-t-1 border-[#14151b] overflow-y-scroll dark-scrollbar">
            <DndContext onDragEnd={handleDragEnd}>
              {selectedCategory === Category.Images && (
                <>
                  {folders.map((folder: Folders) => {
                    return (
                      <DroppableContainer key={folder.id + "_IMAGE_FOLDER"} id={folder.id + "_IMAGE_FOLDER"}>
                        <span className="ml-4 text-[12px]">{folder.name}</span>
                        <ItemList $iscolumn className="pt-1!">
                          {images
                            .filter((data) => data.folderId === folder.id)
                            .map((data) => {
                              return (
                                <DraggableImage key={data.id + "_IMAGE_DATA"} id={data.id + "_IMAGE_DATA"}>
                                  <ItemButton>
                                    <img src={data.data} className="w-[50px] h-[50px]" />
                                  </ItemButton>
                                </DraggableImage>
                              );
                            })}
                        </ItemList>
                      </DroppableContainer>
                    );
                  })}

                  <DroppableContainer id="default_IMAGE_FOLDER">
                    <span className="ml-4 text-[12px]">Default</span>
                    <ItemList $iscolumn className="pt-1!">
                      {images
                        .filter((data) => data.folderId === undefined)
                        .map((data) => {
                          return (
                            <DraggableImage key={data.id + "_IMAGE_DATA"} id={data.id + "_IMAGE_DATA"}>
                              <ItemButton>
                                <img src={data.data} className="w-[50px] h-[50px]" />
                              </ItemButton>
                            </DraggableImage>
                          );
                        })}
                    </ItemList>
                  </DroppableContainer>
                </>
              )}
            </DndContext>

            {selectedCategory === Category.Emotes && (
              <ItemList $iscolumn>
                {sevenTVEmotes && (
                  <>
                    {sevenTVEmotes.map((data) => {
                      return (
                        <li key={data.id + "_7TV_EMOTE"} className="w-fit h-fit">
                          <ItemButton>
                            <img
                              src={"https://cdn.7tv.app/emote/" + data.id + "/3x.webp"}
                              className="w-[50px] h-[50px]"
                            />
                          </ItemButton>
                        </li>
                      );
                    })}
                  </>
                )}

                {betterTVEmotes && (
                  <>
                    {betterTVEmotes.map((data) => {
                      return (
                        <li key={data.id + "_7TV_EMOTE"} className="w-fit h-fit">
                          <ItemButton>
                            <img
                              src={"https://cdn.betterttv.net/emote/" + data.id + "/3x.webp"}
                              className="w-[50px] h-[50px]"
                            />
                          </ItemButton>
                        </li>
                      );
                    })}
                  </>
                )}
              </ItemList>
            )}

            {selectedCategory === Category.Widgets && (
              <ItemList className="grid-auto-flow">
                {widgets.map((data) => {
                  return (
                    <li key={data.id + "_WIDGET_DATA"} className="w-full h-fit">
                      <ItemButton className="w-full text-left p-1 rounded-[4px]">{data.name}</ItemButton>
                    </li>
                  );
                })}
              </ItemList>
            )}
          </div>
        </div>
      )}

      <div className="w-fit p-[13px] bg-[#1E212B] rounded-lg">
        <div className="flex gap-2.5 h-fit">
          <PickerButton onClick={() => setMenuOpen(!menuOpen)}>
            <PickerButtonIcon src={ImageIcon} alt="Images" />
          </PickerButton>

          <PickerButton className="w-[32px] h-[32px]">
            <span className="text-3xl h-fit text-[#717b97]">T</span>
          </PickerButton>
        </div>
      </div>
    </div>
  );
};

const DraggableImage: React.FC<{ id: any; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform != null ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <li ref={setNodeRef} style={style} {...listeners} {...attributes} className="w-fit h-fit">
      {children}
    </li>
  );
};

const DroppableContainer: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
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

const ItemButton = styled.button`
  cursor: pointer;
  border: solid 1px transparent;

  &:hover {
    border: solid 1px #82a5ff;
  }
`;

const ItemList = styled.ul<{ $iscolumn?: boolean }>`
  display: grid;
  ${(props) =>
    props.$iscolumn &&
    css`
      grid-template-columns: repeat(auto-fit, minmax(50px, max-content));
    `}
  list-style: none;
  gap: 13px;
  padding: 10px;
  margin-left: 7px;
`;
