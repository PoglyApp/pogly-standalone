import { Dialog, DialogContent, FormGroup } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { DebugLogger } from "../../Utility/DebugLogger";
import { StyledInput } from "../StyledComponents/StyledInput";
import { useAppSelector } from "../../Store/Features/store";
import { shallowEqual } from "react-redux";
import { SpotlightElement } from "../General/SpotlightElement";
import SevenTVEmoteType from "../../Types/SevenTVTypes/SevenTVEmoteType";
import BetterTVEmoteType from "../../Types/BetterTVTypes/BetterTVEmoteType";
import BetterTVWrap from "../../Utility/BetterTVWrap";
import { insertElement } from "../../StDB/Reducers/Insert/insertElement";
import { LayoutContext } from "../../Contexts/LayoutContext";
import SevenTVWrap from "../../Utility/SevenTVWrap";
import styled from "styled-components";
import { ElementData, ElementStruct, ImageElementData } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { convertBinaryToDataURI } from "../../Utility/ImageConversion";

interface IProps {
  sevenTVEmotes: SevenTVEmoteType[] | undefined;
  bttvEmotes: BetterTVEmoteType[] | undefined;
}

export const SpotlightModal = (props: IProps) => {
  const { activeLayout, setActiveLayout } = useContext(LayoutContext);
  const { spacetimeDB } = useContext(SpacetimeContext);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const elementData: ElementData[] = useAppSelector((state: any) => state.elementData.elementData, shallowEqual);

  const [filteredElementData, setFilteredElementData] = useState<ElementData[]>([]);
  const [filteredSevenTVEmotes, setFilteredSevenTVEmotes] = useState<SevenTVEmoteType[] | undefined>([]);
  const [filteredBttvEmotes, setFilteredBttvEmotes] = useState<BetterTVEmoteType[] | undefined>([]);

  const [searchTerm, setSearchTerm] = useState<string | null>();

  useEffect(() => {
    if (!searchTerm) return;

    const term = searchTerm.toLowerCase();

    setFilteredElementData(() =>
      elementData.filter(
        (data: ElementData) => data.name.toLowerCase().includes(term) && data.dataType.tag === "ImageElement"
      )
    );

    setFilteredSevenTVEmotes(() => {
        if(props.sevenTVEmotes) return props.sevenTVEmotes.filter((data: SevenTVEmoteType) => data.name.toLowerCase().includes(term));
      }
    );
    setFilteredBttvEmotes(() => {
        if(props.bttvEmotes) return props.bttvEmotes.filter((data: BetterTVEmoteType) => data.code.toLowerCase().includes(term));
      }
    );
  }, [searchTerm, elementData, props.sevenTVEmotes, props.bttvEmotes]);

  const AddElementDataToCanvas = (elementData: ElementData) => {
    DebugLogger("Adding ElementData to canvas");

    insertElement(
      spacetimeDB.Client,
      ElementStruct.ImageElement({
        imageElementData: ImageElementData.ElementDataId(elementData.id),
        width: elementData.dataWidth || 128,
        height: elementData.dataHeight || 128,
      }),
      activeLayout
    );

    handleOnClose();
  };

  const AddSevenTVElementToCanvas = (emote: SevenTVEmoteType) => {
    DebugLogger("Adding 7TV emote to canvas");
    var blob = SevenTVWrap.GetURLFromEmote(emote);

    var image = new Image();
    image.src = blob;
    image.onload = function () {
      insertElement(
        spacetimeDB.Client,
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.RawData(blob),
          width: image.width || 128,
          height: image.height || 128,
        }),
        activeLayout
      );
    };

    handleOnClose();
  };

  const AddBetterTVElementToCanvas = (emote: BetterTVEmoteType) => {
    DebugLogger("Adding BetterTV emote to canvas");
    var blob = BetterTVWrap.GetURLFromEmote(emote);

    var image = new Image();
    image.src = blob;
    image.onload = function () {
      insertElement(
        spacetimeDB.Client,
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.RawData(blob),
          width: image.width || 128,
          height: image.height || 128,
        }),
        activeLayout
      );
    };

    handleOnClose();
  };

  const handleOnClose = () => {
    DebugLogger("Handling spotlight modal close");
    setSearchTerm("");
    setFilteredElementData(() => []);
    setFilteredSevenTVEmotes(() => []);
    setFilteredBttvEmotes(() => []);
    document.getElementById("spotlight_modal")?.style.removeProperty("display");
    (document.getElementById("spotlight_search") as HTMLInputElement).value = "";
  };

  if (isOverlay) return <></>;

  return (
    <Dialog
      open={true}
      onClose={handleOnClose}
      sx={{
        ".MuiDialog-paper": {
          minHeight: "100px !important",
          width: "400px !important",
        },
        ".MuiPaper-root": {
          position: "absolute",
          top: "0",
          marginTop: "300px",
        },
        display: "none",
      }}
      id="spotlight_modal"
    >
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingTop: "25px !important" }}>
        <FormGroup>
          <StyledInput
            focused={true}
            id="spotlight_search"
            label="Search"
            color="#ffffffa6"
            onChange={(value: string) => {
              if (value === "") {
                setFilteredElementData(() => []);
                setFilteredSevenTVEmotes(() => []);
                setFilteredBttvEmotes(() => []);
              } else setSearchTerm(value);
            }}
            defaultValue=""
            style={{ width: "100%" }}
          />
        </FormGroup>
      </DialogContent>
      <SelectionContainer id="spotlight_content" tabIndex={-1}>
        {filteredElementData.map((data: ElementData) => {
          return (
            <SpotlightElement
              key={"elementData_" + data.id}
              source={convertBinaryToDataURI(data)}
              name={data.name}
              type="Element Data"
              onclick={() => AddElementDataToCanvas(data)}
            />
          );
        })}

        {filteredSevenTVEmotes && filteredSevenTVEmotes.map((data: SevenTVEmoteType) => {
          return (
            <SpotlightElement
              key={"sevenTV_" + data.id}
              source={"https://cdn.7tv.app/emote/" + data.id + "/3x.webp"}
              name={data.name}
              type="SevenTV"
              onclick={() => AddSevenTVElementToCanvas(data)}
            />
          );
        })}

        {filteredBttvEmotes && filteredBttvEmotes.map((data: BetterTVEmoteType) => {
          return (
            <SpotlightElement
              key={"bttv_" + data.id}
              source={"https://cdn.betterttv.net/emote/" + data.id + "/3x.webp"}
              name={data.code}
              type="BetterTTV"
              onclick={() => AddBetterTVElementToCanvas(data)}
            />
          );
        })}
      </SelectionContainer>
    </Dialog>
  );
};

const SelectionContainer = styled.div`
  max-height: 500px;
  overflow-x: hidden;
`;
