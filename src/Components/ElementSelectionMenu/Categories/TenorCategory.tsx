import { useContext, useState } from "react";
import { useTenor } from "../../../Hooks/useTenor";
import { Accordion, AccordionDetails, AccordionSummary, Button, SvgIcon } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StyledInput } from "../../StyledComponents/StyledInput";
import styled from "styled-components";
import TenorSearchResponseType from "../../../Types/TenorTypes/TenorSearchResponseType";
import { insertElement } from "../../../StDB/Reducers/Insert/insertElement";
import ElementStruct from "../../../module_bindings/element_struct";
import ImageElementData from "../../../module_bindings/image_element_data";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { LayoutContext } from "../../../Contexts/LayoutContext";

export const TenorCategory = () => {
  const layout = useContext(LayoutContext);

  const [tenorEmotes, setTenorEmotes] = useState<any>();
  const [searchEmotes, setSearchEmotes] = useState<string>("");
  const [searchIndex, setSearchIndex] = useState<string>("");

  const apiKey = localStorage.getItem("TenorAPIKey");

  useTenor(apiKey, searchEmotes, searchIndex, setTenorEmotes);

  const handleSearch = (search: string) => {
    setSearchIndex("");
    setSearchEmotes(search);
  };

  const AddTenorToCanvas = (emote: TenorSearchResponseType) => {
    var blob =
      emote.media_formats.webp?.url || emote.media_formats.webp_transparent?.url || emote.media_formats.gif.url;

    var image = new Image();
    image.src = blob;
    image.onload = function () {
      insertElement(
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.RawData(blob),
          width: image.width || 128,
          height: image.height || 128,
        }),
        layout!
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
          <svg xmlns="http://www.w3.org/2000/svg" id="mdi-file-gif-box" viewBox="0 0 24 24">
            <path
              d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M10 10.5H7.5V13.5H8.5V12H10V13.7C10 14.4 9.5 15 8.7 15H7.3C6.5 15 6 14.3 6 13.7V10.4C6 9.7 6.5 9 7.3 9H8.6C9.5 9 10 9.7 10 10.3V10.5M13 15H11.5V9H13V15M17.5 10.5H16V11.5H17.5V13H16V15H14.5V9H17.5V10.5Z"
              fill="currentColor"
            />
          </svg>
        </SvgIcon>
        <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Tenor</span>
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
        {apiKey ? (
          <StyledInput focused={false} label="Search" color="#ffffffa6" onChange={handleSearch} defaultValue={""} />
        ) : (
          <p style={{ color: "#ffffffa6" }}>No API key.</p>
        )}
        <>
          {searchEmotes !== "" && tenorEmotes ? (
            <>
              {tenorEmotes.results.map((e: TenorSearchResponseType) => {
                return (
                  <div key={e.id}>
                    <Button
                      sx={{
                        color: "#ffffffa6",
                        textTransform: "initial",
                      }}
                      title={e.content_description}
                      onClick={() => {
                        AddTenorToCanvas(e);
                      }}
                    >
                      <ElementIcon
                        src={
                          e.media_formats.tinygif?.url ||
                          e.media_formats.tinygif_transparent?.url ||
                          e.media_formats.gif.url
                        }
                        alt={e.content_description}
                      />
                    </Button>
                    <br />
                  </div>
                );
              })}
              <br />
              <Button
                sx={{
                  color: "#ffffffa6",
                  textTransform: "initial",
                }}
                startIcon={<AddCircleOutlineIcon />}
                title="Load more"
                onClick={() => setSearchIndex(tenorEmotes.next)}
              >
                Load more...
              </Button>
            </>
          ) : (
            <></>
          )}
        </>
      </AccordionDetails>
    </Accordion>
  );
};

const ElementIcon = styled.img`
  width: 100%;
  height: 100%;
`;
