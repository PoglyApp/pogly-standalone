import { Accordion, AccordionDetails, AccordionSummary, Button, SvgIcon } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useContext, useEffect, useState } from "react";
import Emote from "../../../Types/SevenTVTypes/EmoteType";
import { useSevenTV } from "../../../Hooks/useSevenTV";
import { insertElement } from "../../../StDB/Reducers/Insert/insertElement";
import ElementStruct from "../../../module_bindings/element_struct";
import ImageElementData from "../../../module_bindings/image_element_data";
import SevenTVWrap from "../../../Utility/SevenTVWrap";
import styled from "styled-components";
import { StyledInput } from "../../StyledComponents/StyledInput";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export const SevenTVCategory = () => {
  const [sevenTVEmotes, setSevenTVEmotes] = useState<Emote[]>([]);
  const [searchEmote, setSearchEmote] = useState<string>("");

  const [shownsevenTVEmotes, setShownSevenTVEmotes] = useState<Emote[]>([]);
  const [maxDisplayed, setMaxDisplayed] = useState<number>(10);

  useSevenTV(setSevenTVEmotes);

  useEffect(() => {
    if (sevenTVEmotes.length < 1) return;
    setShownSevenTVEmotes(() => []);

    const selectedEmotes: Emote[] = [];
    const range: number = maxDisplayed - 1 > sevenTVEmotes.length ? sevenTVEmotes.length : maxDisplayed - 1;

    for (let i = 0; i < range; i++) {
      selectedEmotes.push(sevenTVEmotes[i]);
    }

    setShownSevenTVEmotes(selectedEmotes);
  }, [sevenTVEmotes, maxDisplayed]);

  const AddSevenTVElementToCanvas = (emote: Emote) => {
    var blob = SevenTVWrap.GetURLFromEmote(emote);

    var image = new Image();
    image.src = blob;
    image.onload = function () {
      insertElement(
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.RawData(blob),
          width: image.width || 128,
          height: image.height || 128,
        })
      );
    };
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{
          color: "#ffffffa6",
        }}
      >
        <SvgIcon sx={{ marginRight: "5px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109.6 80.9" width="1em" data-v-bf7c68c0="">
            <g>
              <path d="M84.1,22.2l5-8.7,2.7-4.6L86.8.2V0H60.1l5,8.7,5,8.7,2.8,4.8H84.1" fill="currentColor"></path>
              <path
                d="M29,80.6l5-8.7,5-8.7,5-8.7,5-8.7,5-8.7,5-8.7L62.7,22l-5-8.7-5-8.7L49.9.1H7.7l-5,8.7L0,13.4l5,8.7v.2h32l-5,8.7-5,8.7-5,8.7-5,8.7-5,8.7L8.5,72l5,8.7v.2H29"
                fill="currentColor"
              ></path>
              <path
                d="M70.8,80.6H86.1l5-8.7,5-8.7,5-8.7,5-8.7,3.5-6-5-8.7v-.2H89.2l-5,8.7-5,8.7-.7,1.3-5-8.7-5-8.7-.7-1.3-5,8.7-5,8.7L55,53.1l5,8.7,5,8.7,5,8.7.8,1.4"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </SvgIcon>
        <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Channel Emotes</span>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#000c17",
          paddingBottom: "5px",
          maxHeight: "800px",
          overflowY: "scroll",
          overflowX: "hidden",
          "::-webkit-scrollbar": { width: "0", background: "transparent" },
        }}
      >
        <StyledInput focused={false} label="Search" color="#ffffffa6" onChange={setSearchEmote} defaultValue={""} />
        <>
          {searchEmote !== "" && sevenTVEmotes ? (
            <>
              {sevenTVEmotes.map((e) => {
                if (searchEmote === "" || e.name.toLowerCase().includes(searchEmote.toLowerCase())) {
                  return (
                    <div key={e.id}>
                      <Button
                        sx={{
                          color: "#ffffffa6",
                          textTransform: "initial",
                        }}
                        title={e.name}
                        onClick={() => AddSevenTVElementToCanvas(e)}
                      >
                        <ElementIcon src={"https://cdn.7tv.app/emote/" + e.id + "/3x.webp"} alt={e.name} />
                        {e.name.length > 15 ? e.name.substring(0, 15) + "..." : e.name}
                      </Button>
                      <br />
                    </div>
                  );
                }

                return null;
              })}
            </>
          ) : (
            <>
              {shownsevenTVEmotes.map((e) => {
                return (
                  <div key={e.id}>
                    <Button
                      sx={{
                        color: "#ffffffa6",
                        textTransform: "initial",
                      }}
                      title={e.name}
                      onClick={() => AddSevenTVElementToCanvas(e)}
                    >
                      <ElementIcon src={"https://cdn.7tv.app/emote/" + e.id + "/3x.webp"} alt={e.name} />
                      {e.name.length > 15 ? e.name.substring(0, 15) + "..." : e.name}
                    </Button>
                    <br />
                  </div>
                );
              })}
              {maxDisplayed - 1 < sevenTVEmotes.length && (
                <>
                  <br />
                  <Button
                    sx={{
                      color: "#ffffffa6",
                      textTransform: "initial",
                    }}
                    startIcon={<AddCircleOutlineIcon />}
                    title="Load more"
                    onClick={() => setMaxDisplayed((value) => value + 10)}
                  >
                    Load more {`(${maxDisplayed}/${sevenTVEmotes.length})`}
                  </Button>
                </>
              )}
            </>
          )}
        </>
      </AccordionDetails>
    </Accordion>
  );
};

const ElementIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;
