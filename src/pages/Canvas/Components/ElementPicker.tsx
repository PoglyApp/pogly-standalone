import styled, { css } from "styled-components";
import ImageIcon from "@/Assets/Icons/ImagePickIcon.svg";
import { useContext, useEffect, useState } from "react";
import { TextInput } from "@/Components/Inputs/TextInput";
import { Button } from "@/Components/Inputs/Button";
import { ElementData } from "@/module_bindings";
import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { useChannelEmotes } from "@/Hooks/useChannelEmotes";
import SevenTVEmote from "@/Types/SevenTVTypes/SevenTVEmoteType";
import BetterTVEmote from "@/Types/BetterTVTypes/BetterTVEmoteType";
import { PlusCircleIcon } from "lucide-react";

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
  const [sevenTVEmotes, setSevenTVEmotes] = useState<SevenTVEmote[] | null>(null);
  const [betterTVEmotes, setBetterTVEmotes] = useState<BetterTVEmote[] | null>(null);
  const [widgets, setWidgets] = useState<ElementData[]>([]);

  useChannelEmotes(setSevenTVEmotes, setBetterTVEmotes);

  useEffect(() => {
    if (!spacetimeDB) return;

    const elementData: ElementData[] = Array.from(spacetimeDB.Client.db.elementData.iter());

    setImages(elementData.filter((data: ElementData) => data.dataType.tag === "ImageElement"));
    setWidgets(elementData.filter((data: ElementData) => data.dataType.tag === "WidgetElement"));
  }, [spacetimeDB]);

  const addNewFolder = () => {
    spacetimeDB.Client.reducers.addFolder("New folder", "");
  };

  return (
    <div className="grid">
      {menuOpen && (
        <div className="absolute justify-self-center bottom-20 w-[485px] h-[500px] bg-[#1e212b] rounded-[8px] overflow-hidden flex flex-col appear">
          <div className="flex pt-4 pl-4 gap-2">
            <CategoryButton
              selected={selectedCategory === Category.Images}
              onClick={() => setSelectedCategory(Category.Images)}
            >
              Images
            </CategoryButton>
            <CategoryButton
              selected={selectedCategory === Category.Emotes}
              onClick={() => setSelectedCategory(Category.Emotes)}
            >
              Emotes
            </CategoryButton>
            <CategoryButton
              selected={selectedCategory === Category.Widgets}
              onClick={() => setSelectedCategory(Category.Widgets)}
            >
              Widgets
            </CategoryButton>
          </div>

          <div className="flex mt-3 ml-4 mr-4">
            <TextInput placeholder="Search..." onChange={() => {}} inputClassName="h-[37px] text-[14px]" />
            {selectedCategory === Category.Images && (
              <Button onClick={() => {}} className="w-[150px] h-[37px] text-[14px]">
                Add images
              </Button>
            )}
          </div>

          <div className="h-full w-full mt-2 border-t-1 border-[#14151b] overflow-y-scroll dark-scrollbar">
            {selectedCategory === Category.Images && (
              <div>
                <div className="absolute h-full w-[50px] pt-3 bg-[#22242c] text-center">
                  <ItemButton onClick={addNewFolder}>
                    <PlusCircleIcon className="w-[32px] h-[32px]" />
                  </ItemButton>
                </div>
                <ItemList $iscolumn className="ml-14 pl-0">
                  {images.map((data) => {
                    return (
                      <li key={data.id + "_IMAGE_DATA"} className="w-fit h-fit">
                        <ItemButton>
                          <img src={data.data} className="w-[50px] h-[50px]" />
                        </ItemButton>
                      </li>
                    );
                  })}
                </ItemList>
              </div>
            )}

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
  gap: 10px;
  padding: 10px;
`;
