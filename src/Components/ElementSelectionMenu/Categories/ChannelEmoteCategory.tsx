import { Accordion, AccordionDetails, AccordionSummary, Button, SvgIcon } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useContext, useEffect, useState } from "react";
import SevenTVEmote from "../../../Types/SevenTVTypes/SevenTVEmoteType";
import { insertElement } from "../../../StDB/Reducers/Insert/insertElement";
import SevenTVWrap from "../../../Utility/SevenTVWrap";
import styled from "styled-components";
import { StyledInput } from "../../StyledComponents/StyledInput";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { LayoutContext } from "../../../Contexts/LayoutContext";
import BetterTVEmote from "../../../Types/BetterTVTypes/BetterTVEmoteType";
import BetterTVWrap from "../../../Utility/BetterTVWrap";
import { SevenTVIcon, BetterTVIcon } from "../../../Utility/SVGIcons";
import ChannelEmote from "../../../Types/General/ChannelEmoteType";
import { DebugLogger } from "../../../Utility/DebugLogger";
import { ElementStruct, ImageElementData } from "../../../module_bindings";

interface IProps {
  sevenTVEmotes: SevenTVEmote[] | undefined;
  betterTVEmotes: BetterTVEmote[] | undefined;
}

export const ChannelEmoteCategory = (props: IProps) => {
  const layoutContext = useContext(LayoutContext);

  const [sevenTVEmotes, setSevenTVEmotes] = useState<SevenTVEmote[]>([]);
  const [betterTVEmotes, setBetterTVEmotes] = useState<BetterTVEmote[]>([]);
  const [searchEmote, setSearchEmote] = useState<string>("");

  const [shownEmotes, setShownEmotes] = useState<ChannelEmote[]>([]);
  const [maxDisplayed, setMaxDisplayed] = useState<number>(10);

  useEffect(() => {
    if(!props.sevenTVEmotes) return;
    if(!props.betterTVEmotes) return;
    setSevenTVEmotes(() => [...props.sevenTVEmotes!]);
    setBetterTVEmotes(() => [...props.betterTVEmotes!]);
  }, [props.sevenTVEmotes, props.betterTVEmotes]);

  useEffect(() => {
    if (sevenTVEmotes.length < 1) return;
    setShownEmotes(() => []);

    DebugLogger("Initializing channel emotes category");

    const selectedChannelEmotes: ChannelEmote[] = [];
    const range: number =
      maxDisplayed - 1 > sevenTVEmotes.length + betterTVEmotes.length
        ? sevenTVEmotes.length + betterTVEmotes.length
        : maxDisplayed - 1;

    for (let i = 0; i < range; i++) {
      if (i <= sevenTVEmotes.length - 1) {
        selectedChannelEmotes.push({
          type: "7tv",
          emote: sevenTVEmotes[i],
        });
      } else {
        selectedChannelEmotes.push({
          type: "bttv",
          emote: betterTVEmotes[i - sevenTVEmotes.length],
        });
      }
    }

    setShownEmotes(selectedChannelEmotes);
  }, [sevenTVEmotes, betterTVEmotes, maxDisplayed]);

  const AddSevenTVElementToCanvas = (emote: SevenTVEmote) => {
    DebugLogger("Adding 7TV emote to canvas");
    var blob = SevenTVWrap.GetURLFromEmote(emote);

    var image = new Image();
    image.src = blob;
    image.onload = function () {
      insertElement(
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.RawData(blob),
          width: image.width || 128,
          height: image.height || 128,
        }),
        layoutContext.activeLayout
      );
    };
  };

  const AddBetterTVElementToCanvas = (emote: BetterTVEmote) => {
    DebugLogger("Adding BetterTV emote to canvas");
    var blob = BetterTVWrap.GetURLFromEmote(emote);

    var image = new Image();
    image.src = blob;
    image.onload = function () {
      insertElement(
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.RawData(blob),
          width: image.width || 128,
          height: image.height || 128,
        }),
        layoutContext.activeLayout
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
        <SvgIcon sx={{ marginRight: "5px" }}>{SevenTVIcon(true)}</SvgIcon>
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
                          justifyContent: "left",
                          width: "100%",
                        }}
                        title={e.name}
                        onClick={() => AddSevenTVElementToCanvas(e)}
                      >
                        <ElementIcon src={"https://cdn.7tv.app/emote/" + e.id + "/3x.webp"} alt={e.name} />
                        <SvgIcon sx={{ marginRight: "5px", width: "16px", height: "16px" }}>
                          {SevenTVIcon(true)}
                        </SvgIcon>
                        {e.name.length > 10 ? e.name.substring(0, 10) + "..." : e.name}
                      </Button>
                      <br />
                    </div>
                  );
                }

                return null;
              })}
              {betterTVEmotes.map((e) => {
                if (searchEmote === "" || e.code.toLowerCase().includes(searchEmote.toLowerCase())) {
                  return (
                    <div key={e.id}>
                      <Button
                        sx={{
                          color: "#ffffffa6",
                          textTransform: "initial",
                          justifyContent: "left",
                          width: "100%",
                        }}
                        title={e.code}
                        onClick={() => AddBetterTVElementToCanvas(e)}
                      >
                        <ElementIcon src={"https://cdn.betterttv.net/emote/" + e.id + "/3x.webp"} alt={e.code} />
                        <SvgIcon sx={{ marginRight: "5px", width: "16px", height: "16px" }}>{BetterTVIcon()}</SvgIcon>
                        {e.code.length > 10 ? e.code.substring(0, 10) + "..." : e.code}
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
              {shownEmotes.map((e) => {
                switch (e.type) {
                  case "7tv":
                    return (
                      <div key={(e.emote as SevenTVEmote).id}>
                        <Button
                          sx={{
                            color: "#ffffffa6",
                            textTransform: "initial",
                            justifyContent: "left",
                            width: "100%",
                          }}
                          title={(e.emote as SevenTVEmote).name}
                          onClick={() => AddSevenTVElementToCanvas(e.emote as SevenTVEmote)}
                        >
                          <ElementIcon
                            src={"https://cdn.7tv.app/emote/" + (e.emote as SevenTVEmote).id + "/3x.webp"}
                            alt={(e.emote as SevenTVEmote).name}
                          />
                          <SvgIcon sx={{ marginRight: "5px", width: "16px", height: "16px" }}>
                            {SevenTVIcon(false)}
                          </SvgIcon>
                          {(e.emote as SevenTVEmote).name.length > 10
                            ? (e.emote as SevenTVEmote).name.substring(0, 10) + "..."
                            : (e.emote as SevenTVEmote).name}
                        </Button>
                        <br />
                      </div>
                    );
                  case "bttv":
                    return (
                      <div key={(e.emote as BetterTVEmote).id}>
                        <Button
                          sx={{
                            color: "#ffffffa6",
                            textTransform: "initial",
                            justifyContent: "left",
                            width: "100%",
                          }}
                          title={(e.emote as BetterTVEmote).code}
                          onClick={() => AddBetterTVElementToCanvas(e.emote as BetterTVEmote)}
                        >
                          <ElementIcon
                            src={"https://cdn.betterttv.net/emote/" + (e.emote as BetterTVEmote).id + "/3x.webp"}
                            alt={(e.emote as BetterTVEmote).code}
                          />
                          <SvgIcon sx={{ marginRight: "5px", width: "16px", height: "16px" }}>{BetterTVIcon()}</SvgIcon>
                          {(e.emote as BetterTVEmote).code.length > 10
                            ? " " + (e.emote as BetterTVEmote).code.substring(0, 10) + "..."
                            : " " + (e.emote as BetterTVEmote).code}
                        </Button>
                        <br />
                      </div>
                    );
                  default:
                    return <></>;
                }
              })}
              {maxDisplayed - 1 < sevenTVEmotes.length + betterTVEmotes.length && (
                <>
                  <br />
                  <Button
                    sx={{
                      color: "#ffffffa6",
                      textTransform: "initial",
                      justifyContent: "left",
                      width: "100%",
                    }}
                    startIcon={<AddCircleOutlineIcon />}
                    title="Load more"
                    onClick={() => setMaxDisplayed((value) => value + 10)}
                  >
                    Load more {`(${maxDisplayed}/${sevenTVEmotes.length + betterTVEmotes.length})`}
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
