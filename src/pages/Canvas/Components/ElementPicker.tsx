import styled, { css } from "styled-components";
import ImageIcon from "@/Assets/Icons/ImagePickIcon.svg";
import { useContext, useEffect, useState } from "react";
import { TextInput } from "@/Components/Inputs/TextInput";
import { Button } from "@/Components/Inputs/Button";
import { DataType, ElementData, Folders } from "@/module_bindings";
import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { useChannelEmotes } from "@/Hooks/useChannelEmotes";
import SevenTVEmote from "@/Types/SevenTVTypes/SevenTVEmoteType";
import BetterTVEmote from "@/Types/BetterTVTypes/BetterTVEmoteType";
import {
  ChevronDown,
  CircleXIcon,
  FileImageIcon,
  FolderPlusIcon,
  ImagePlayIcon,
  LinkIcon,
  Trash2Icon,
} from "lucide-react";

import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { useElementDataEvents } from "@/StDB/Hooks_NEW/useElementDataEvents";
import { useFolderEvents } from "@/StDB/Hooks_NEW/useFolderEvents";
import { ElementDataType } from "@/Types/General/ElementDataType";
import { insertElementData } from "@/StDB/Reducers/Insert/insertElementData";

enum Category {
  Images,
  Emotes,
  Widgets,
}

export const ElementPicker = () => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.Images);
  const [initialized, setInitialized] = useState<boolean>(false);

  const [images, setImages] = useState<ElementData[]>([]);
  const [folders, setFolders] = useState<Folders[]>([]);
  const [sevenTVEmotes, setSevenTVEmotes] = useState<SevenTVEmote[] | null>(null);
  const [betterTVEmotes, setBetterTVEmotes] = useState<BetterTVEmote[] | null>(null);
  const [widgets, setWidgets] = useState<ElementData[]>([]);

  const [showFolderNameInput, setShowFolderInput] = useState<boolean>(false);
  const [folderNameInput, setFolderNameInput] = useState<string>();
  const [hiddenFolders, setHiddenFolders] = useState<Folders[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);

  const [showImageUpload, setShowImageUpload] = useState<boolean>(false);
  const [showDirectUpload, setShowDirectUpload] = useState<boolean>(false);
  const [directFile, setDirectFile] = useState<any>();
  const [urlFile, setUrlFile] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [highlightedData, setHighlightedData] = useState<ElementData | null>(null);

  useChannelEmotes(setSevenTVEmotes, setBetterTVEmotes);

  useElementDataEvents(setInitialized);
  useFolderEvents(setInitialized);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    const elementData: ElementData[] = Array.from(spacetimeDB.Client.db.elementData.iter());
    const imageFolders: Folders[] = Array.from(spacetimeDB.Client.db.folders.iter());

    setImages(elementData.filter((data: ElementData) => data.dataType.tag === "ImageElement"));
    setWidgets(elementData.filter((data: ElementData) => data.dataType.tag === "WidgetElement"));
    setFolders(imageFolders);
  }, [spacetimeDB, initialized]);

  const changeCategory = (category: Category) => {
    if (selectedCategory === category) return;

    setSelectedCategory(category);
    setShowFolderInput(false);
  };

  const addNewFolder = () => {
    if (!folderNameInput || folderNameInput.length === 0) return;
    spacetimeDB.Client.reducers.addFolder(folderNameInput);
    setShowFolderInput(false);
    setFolderNameInput("");
  };

  const deleteFolder = (folder: Folders) => {
    spacetimeDB.Client.reducers.deleteFolder(folder.id, true);
  };

  const toggleFolderVisibility = (folder: Folders) => {
    if (hiddenFolders.includes(folder)) {
      setHiddenFolders(hiddenFolders.filter((f: Folders) => f.id !== folder.id));
    } else {
      setHiddenFolders((old: Folders[]) => [...old, folder]);
    }
  };

  const handleFileChange = async (changedFile: any) => {
    const isImage =
      changedFile.type === "image/png" ||
      changedFile.type === "image/jpg" ||
      changedFile.type === "image/jpeg" ||
      changedFile.type === "image/webp" ||
      changedFile.type === "image/gif";

    if (!isImage) {
      setUploadError("wrong file format");
      setDirectFile(null);
      return;
    }

    setUploadError(null);
    setImageName(changedFile.name.substr(0, changedFile.name.lastIndexOf(".")));
    setDirectFile(changedFile);
  };

  const readFileAsync = async (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);

      reader.readAsDataURL(file);
    });
  };

  const handleUrlChange = (url: string) => {
    const isValidUrl = url.match(/\.(png|jpg|jpeg|webp|gif|avif)$/);

    setUrlFile(url);

    if (url !== "" && !isValidUrl) {
      return setUploadError("url is not a valid image url");
    }

    setUploadError(null);
  };

  const handleUpload = async () => {
    const size: number = urlFile ? 0 : directFile.size;
    const usedFile: string = urlFile ? urlFile : ((await readFileAsync(directFile)) as string);

    const newElementData: ElementDataType = {
      Name: imageName || "Image",
      DataType: DataType.ImageElement as DataType,
      Data: usedFile,
      DataFileSize: size / 1024,
      CreatedBy: spacetimeDB.Identity.nickname,
    };

    insertElementData(spacetimeDB.Client, newElementData);
    setShowImageUpload(false);
    setDirectFile(null);
    setUrlFile("");
    setImageName("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(false);

    const { active, over } = event;
    if (!over) return;

    const elementDataID = active.id.toString().replace("_IMAGE_DATA", "");
    const folderID: any = over.id.toString().replace("_IMAGE_FOLDER", "");

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
                <Button onClick={() => setShowImageUpload(!showImageUpload)} className="w-fit h-[37px] text-[14px]">
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

          {showImageUpload && (
            <div className="flex flex-col mt-3 ml-4 mr-4 gap-3">
              <div className="flex flex-col gap-2">
                <span className="flex text-[14px]">
                  select a file{" "}
                  {showDirectUpload ? (
                    <LinkIcon
                      className="w-[14px] h-[14px] self-center ml-2 cursor-pointer"
                      onClick={() => setShowDirectUpload(false)}
                    />
                  ) : (
                    <FileImageIcon
                      className="w-[14px] h-[14px] self-center ml-2 cursor-pointer"
                      onClick={() => setShowDirectUpload(true)}
                    />
                  )}
                </span>
                {showDirectUpload ? (
                  <>
                    <span className="text-[10px]">uploading images directly increases load times significantly</span>
                    <label className="flex bg-[#10121a] text-gray-400 p-3 rounded-md w-full h-[37px] text-[14px] items-center cursor-pointer">
                      {directFile ? directFile.name : "select a file"}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        className="hidden"
                        onChange={(event: any) => handleFileChange(event.target.files[0])}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <a
                      href="https://pogly.gg/assets/URLExample.png"
                      target="_blank"
                      rel="noreferrer"
                      className=" text-[#82a5ff] text-[10px]"
                    >
                      (what is direct image url?)
                    </a>
                    <TextInput
                      placeholder="direct image url"
                      onChange={(event) => handleUrlChange(event.target.value)}
                      value={urlFile}
                      inputClassName="h-[37px] text-[14px]"
                    />
                  </>
                )}
              </div>

              {uploadError && (
                <div className="p-1 bg-[#ff3333] border border-[#8d2424] rounded-[6px]">
                  <span className="flex gap-2">
                    <CircleXIcon /> {uploadError}
                  </span>
                </div>
              )}

              <TextInput
                placeholder="image name"
                onChange={(event) => setImageName(event.target.value)}
                value={imageName}
                inputClassName="h-[37px] text-[14px]"
              />
              <Button
                onClick={handleUpload}
                className="w-fit h-[37px] text-[14px] ml-0!"
                disabled={(!urlFile && !directFile) || uploadError !== null}
              >
                upload
              </Button>
            </div>
          )}

          <div className="h-full w-full mt-2 border-t-1 border-[#14151b] overflow-y-scroll dark-scrollbar">
            <DndContext onDragEnd={handleDragEnd} onDragStart={() => setDragging(true)}>
              {selectedCategory === Category.Images && (
                <>
                  {folders.map((folder: Folders) => {
                    return (
                      <DroppableContainer
                        key={folder.id + "_IMAGE_FOLDER"}
                        id={folder.id + "_IMAGE_FOLDER"}
                        dragging={dragging}
                      >
                        <FolderTitle className="ml-4 text-[12px] flex select-none">
                          {folder.name}{" "}
                          <ChevronDown
                            className={`ml-1 w-[16px] h-[16px] self-center cursor-pointer select-none ${hiddenFolders.includes(folder) ? "-rotate-90" : "rotate-0"}`}
                            onClick={() => toggleFolderVisibility(folder)}
                          />
                          <Trash2Icon
                            className="absolute mr-5 w-[14px] h-[14px] self-center right-0 cursor-pointer select-none hidden"
                            onClick={() => deleteFolder(folder)}
                          />
                        </FolderTitle>
                        <ItemList
                          $iscolumn
                          className={`pt-1! ${hiddenFolders.includes(folder) ? "hidden!" : ""}`}
                          id={folder.id + "_IMAGE_FOLDER"}
                        >
                          {images
                            .filter((data) => data.folderId === folder.id)
                            .map((data) => {
                              return (
                                <DraggableImage key={data.id + "_IMAGE_DATA"} id={data.id + "_IMAGE_DATA"}>
                                  <ItemButton
                                    onMouseEnter={() => setHighlightedData(data)}
                                    onMouseLeave={() => setHighlightedData(null)}
                                  >
                                    <img src={data.data} className="w-[50px] h-[50px]" />
                                  </ItemButton>
                                </DraggableImage>
                              );
                            })}
                        </ItemList>
                      </DroppableContainer>
                    );
                  })}

                  <DroppableContainer id="0_IMAGE_FOLDER" dragging={dragging}>
                    <span className="ml-4 text-[12px] select-none">Default</span>
                    <ItemList $iscolumn className="pt-1! select-none" id="0_IMAGE_FOLDER">
                      {images
                        .filter((data) => data.folderId === 0)
                        .map((data) => {
                          return (
                            <DraggableImage key={data.id + "_IMAGE_DATA"} id={data.id + "_IMAGE_DATA"}>
                              <ItemButton
                                onMouseEnter={() => setHighlightedData(data)}
                                onMouseLeave={() => setHighlightedData(null)}
                              >
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
          {highlightedData && (
            <div className="flex border-t border-[#14151b] h-[50px] p-3 gap-2">
              <img src={highlightedData.data} className="flex w-[24px] h-[24px]" />
              <div className="grid self-center">
                <span className="text-[12px]">{highlightedData.name}</span>
                {highlightedData.createdBy && (
                  <span className="text-[10px] text-gray-400">Added by {highlightedData.createdBy}</span>
                )}
              </div>
            </div>
          )}
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
    <li ref={setNodeRef} id={id} style={style} {...listeners} {...attributes} className="w-fit h-fit">
      {children}
    </li>
  );
};

const DroppableContainer: React.FC<{ id: string; dragging: boolean; children: React.ReactNode }> = ({
  id,
  dragging,
  children,
}) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`mt-2 border rounded-[4px] ${dragging ? "border-[#2c2f3a]" : "border-transparent"}`}
    >
      {children}
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

const FolderTitle = styled.span`
  &:hover svg:nth-of-type(2) {
    display: unset !important;
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
  padding: 0px 10px 0 10px;
  margin-left: 7px;
`;
