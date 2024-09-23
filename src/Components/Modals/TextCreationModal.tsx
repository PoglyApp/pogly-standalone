import { useContext, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  Button,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  AccordionDetails,
  AccordionSummary,
  Accordion,
} from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import ElementStruct from "../../module_bindings/element_struct";
import { insertElement } from "../../StDB/Reducers/Insert/insertElement";
import { ModalContext } from "../../Contexts/ModalContext";
import TextElement from "../../module_bindings/text_element";
import Elements from "../../module_bindings/elements";
import { StdbToViewportFontSize, ViewportToStdbFontSize } from "../../Utility/ConvertCoordinates";
import UpdateTextElementTextReducer from "../../module_bindings/update_text_element_text_reducer";
import { updateTextElement } from "../../StDB/Reducers/Update/updateTextElement";
import { LayoutContext } from "../../Contexts/LayoutContext";
import styled from "styled-components";
import { HexColorPicker } from "react-colorful";
import { GetFontFamily } from "../../Utility/GetFontFamily";
import { DebugLogger } from "../../Utility/DebugLogger";

import Markdown from "react-markdown";
import { MarkdownEditor } from "../General/MarkdownEditor";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface IProps {
  editElementId?: number;
}

const fonts = ["Roboto", "Tiny5", "Lato", "Ubuntu", "Merriweather", "Bebas Neue", "Anton"];

export const TextCreationModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const layoutContext = useContext(LayoutContext);

  const [text, setText] = useState<string>("");

  const [selectedFont, setSelectedFont] = useState<string>("Roboto");
  const [useCustomFont, setUseCustomFont] = useState<boolean>(false);
  const [customFont, setCustomFont] = useState<string>("");
  const [fontSize, setFontSize] = useState<string>("12");
  const [shadowColor, setShadowColor] = useState<string>("#000000");
  const [shadowHeight, setShadowHeight] = useState<string>("2");
  const [shadowWidth, setShadowWidth] = useState<string>("2");

  const [textColor, setTextColor] = useState<string>("#FFFFFF");
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);

  const [showTextColorPicker, setShowTextColorPicker] = useState<boolean>(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [showModal, setShowModal] = useState<Boolean>(false);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    DebugLogger("Initializing text creation modal");
    if (!props.editElementId) return setShowModal(true);

    const textElement = Elements.findById(props.editElementId);
    if (!textElement) return;

    const textStruct: TextElement = textElement.element.value as TextElement;

    setText(textStruct.text);
    setFontSize(StdbToViewportFontSize(textStruct.size).fontSize.toString());
    setTextColor(textStruct.color);

    const shadowVariables = textStruct.css.split(" ");

    setShadowHeight(shadowVariables[0].replace("px", ""));
    setShadowWidth(shadowVariables[1].replace("px", ""));
    setShadowColor(shadowVariables[2]);

    try {
      DebugLogger("Using custom font");
      const fontJson = JSON.parse(textStruct.font);

      setCustomFont(fontJson.fontUrl);
      setUseCustomFont(true);
    } catch (error) {
      DebugLogger("Using pre-added fonts");
      setSelectedFont(textStruct.font);
    }

    setShowModal(true);
  }, [props.editElementId]);

  useEffect(() => {
    setError("");
    DebugLogger("Resetting text creation error");
  }, [useCustomFont]);

  const handleTextChange = (newText: any) => {
    DebugLogger("Text updated");
    if (newText.length < 1) {
      DebugLogger("Text too short");
      setText("");
      return setError("Text has to be at least 1 characters long.");
    }

    setText(newText);
    setError("");

    if (props.editElementId) {
      UpdateTextElementTextReducer.call(props.editElementId, newText);
    }
  };

  const handleCustomFontChange = (newFont: any) => {
    DebugLogger("Custom font updated");
    const validUrl =
      /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
        newFont
      );

    if (!validUrl) return;

    setCustomFont(newFont);
  };

  const handleFontSizeChange = (newFontSize: any) => {
    DebugLogger("Font size updated");
    const regex = new RegExp("^[0-9]+$");

    if (newFontSize.length < 1) {
      DebugLogger("Font field empty");
      setFontSize("");
      return setError("Font size cannot be blank.");
    }

    if (!regex.test(newFontSize)) {
      DebugLogger("Font size not a number");
      setFontSize("");
      return setError("Font size has to be a number.");
    }

    setFontSize(newFontSize);
    setError("");
  };

  const handleTextColorChange = (color: any) => {
    DebugLogger("Text color updated");
    if (color.length < 3) {
      DebugLogger("Color hex not long enough");
      setError("Color hex has to be at least 3 characters long.");
    } else {
      setError("");
    }

    setTextColor(color);
  };

  const handleShadowColorChange = (color: any) => {
    DebugLogger("Shadow color updated");
    if (color.length < 3) {
      DebugLogger("Shadow hex not long enough");
      setError("Shadow hex has to be at least 3 characters long.");
    } else {
      setError("");
    }

    setShadowColor(color);
  };

  const handleShadowSizeChange = (newShadowSize: any, height: boolean) => {
    const regex = new RegExp("^[0-9]+$");

    if (newShadowSize.length < 1) {
      DebugLogger("Shadow field size empty");
      if (height) setShadowHeight("");
      else setShadowWidth("");

      return setError("Shadow size field cannot be blank.");
    }

    if (!regex.test(newShadowSize)) {
      DebugLogger("Shadow size not a number");
      if (height) setShadowHeight("");
      else setShadowWidth("");
      return;
    }

    if (height) setShadowHeight(newShadowSize);
    else setShadowWidth(newShadowSize);
  };

  const handleOnClose = () => {
    DebugLogger("Closing text creation modal");
    closeModal("textCreation_modal", modals, setModals);
  };

  const handleSave = async (close: boolean) => {
    DebugLogger("Saving new text");
    let useFont = selectedFont;

    if (useCustomFont) {
      DebugLogger("Using custom font");
      const fontFamily = await GetFontFamily(customFont);

      if (!fontFamily) return setError("Could not get font family. Please make sure you provide a direct CDN URL.");

      useFont = JSON.stringify({ fontUrl: customFont, fontFamily: fontFamily });
    }

    const textElement: ElementStruct = ElementStruct.TextElement({
      text: text,
      size: ViewportToStdbFontSize(parseInt(fontSize)).fontSize,
      color: textColor,
      font: useFont,
      css: `${shadowHeight}px ${shadowWidth}px ${shadowColor}`,
    });

    if (!props.editElementId) {
      DebugLogger("Inserting new text");
      insertElement(textElement, layoutContext.activeLayout);
    } else {
      DebugLogger("Updating old text");
      updateTextElement(props.editElementId, textElement);
    }

    if (close) handleOnClose();
  };

  if (isOverlay) return <></>;

  return (
    <>
      {showModal && (
        <Dialog
          open={true}
          onClose={handleOnClose}
          sx={{ "* > .MuiPaper-root": { overflow: "visible", minWidth: "500px !important" } }}
        >
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>
            {props.editElementId ? "Edit text" : "Add text"}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            <Typography variant="h6" color="#ffffffa6">
              Text preview
            </Typography>
            <PreviewContainer
              style={{
                color: textColor,
                fontSize: fontSize ? ViewportToStdbFontSize(parseInt(fontSize)).fontSize : 1,
                fontFamily: !useCustomFont ? selectedFont : "inherit",
                textShadow: `${shadowHeight}px ${shadowWidth}px ${shadowColor}`,
              }}
            >
              <Markdown>{text}</Markdown>
            </PreviewContainer>

            {useCustomFont && (
              <Alert
                variant="filled"
                severity="warning"
                sx={{
                  backgroundColor: "#f57c00 !important",
                  color: "#212121",
                  marginTop: "15px",
                  marginBottom: "15px",
                }}
              >
                Custom fonts cannot be previewed.
              </Alert>
            )}

            <MarkdownEditor text={text} setText={handleTextChange} style={{ marginBottom: "15px" }} />

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                  color: "#ffffffa6",
                  backgroundColor: "#001529 !important",
                }}
              >
                <span style={{ lineHeight: 1.5, fontSize: "15px" }}>General settings</span>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: "#000c17",
                  paddingBottom: "0px",
                  paddingTop: "15px",
                  maxHeight: "800px",
                  overflowY: "scroll",
                  overflowX: "hidden",
                  "::-webkit-scrollbar": { width: "0", background: "transparent" },
                  "> *": {
                    marginBottom: "20px",
                  },
                }}
              >
                <FormControl
                  fullWidth
                  sx={{ "&:hover": { borderColor: "#ffffffa6 !important" }, marginBottom: "15px" }}
                >
                  {!useCustomFont ? (
                    <>
                      <InputLabel id="fontSelectLabel" sx={{ color: "#ffffffa6" }}>
                        Font
                      </InputLabel>
                      <Select
                        labelId="fontSelectLabel"
                        id="fontSelectLabel"
                        value={selectedFont}
                        label="Font"
                        onChange={(event) => setSelectedFont(event.target.value)}
                        variant="outlined"
                        sx={{
                          "label + &": { color: "#ffffffa6" },
                          ".MuiOutlinedInput-notchedOutline ": { borderColor: "#ffffffa6", borderWidth: "2px" },
                          ".MuiSvgIcon-root": { fill: "#ffffffa6" },
                          "&:hover": {
                            "&& fieldset": {
                              borderColor: "#ffffffa6",
                            },
                          },
                          width: "150px",
                        }}
                      >
                        {fonts.map((_font: string) => {
                          return (
                            <MenuItem key={_font} value={_font}>
                              {_font}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </>
                  ) : (
                    <StyledInput
                      focused={false}
                      label="Font URL"
                      color="#ffffffa6"
                      defaultValue={customFont}
                      onChange={(text: any) => handleCustomFontChange(text)}
                      style={{ width: "210px" }}
                    />
                  )}

                  <FormControlLabel
                    componentsProps={{
                      typography: { color: "#ffffffa6" },
                    }}
                    control={
                      <Checkbox
                        onChange={() => setUseCustomFont(!useCustomFont)}
                        checked={useCustomFont}
                        sx={{ color: "#ffffffa6" }}
                      />
                    }
                    label="Use custom font"
                  />
                </FormControl>

                <StyledInput
                  focused={false}
                  label="Font size"
                  color="#ffffffa6"
                  onChange={(text: any) => handleFontSizeChange(text)}
                  defaultValue={fontSize}
                />

                <div style={{ display: "flex" }}>
                  <ColorBox
                    color={textColor}
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    style={{ backgroundColor: textColor, marginRight: "10px" }}
                  />
                  <div>
                    <Typography variant="subtitle2" color="#ffffffa6">
                      Color
                    </Typography>
                    <StyledColorInput
                      type="text"
                      name="variableValue"
                      value={textColor}
                      onChange={(event) => handleTextColorChange(event.target.value)}
                    />
                  </div>
                  {showTextColorPicker && (
                    <Popover>
                      <Cover onClick={() => setShowTextColorPicker(!showTextColorPicker)} />
                      <HexColorPicker color={textColor} onChange={(color) => handleTextColorChange(color)} />
                    </Popover>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                  color: "#ffffffa6",
                  backgroundColor: "#001529 !important",
                }}
              >
                <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Styling</span>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: "#000c17",
                  paddingBottom: "0px",
                  paddingTop: "15px",
                  maxHeight: "800px",
                  overflowY: "scroll",
                  overflowX: "hidden",
                  "::-webkit-scrollbar": { width: "0", background: "transparent" },
                  "> *": {
                    marginBottom: "20px",
                  },
                }}
              >
                <Typography variant="subtitle1" color="#ffffffa6" marginBottom={1}>
                  Text Shadow
                </Typography>

                <div style={{ display: "flex" }}>
                  <ColorBox
                    color={shadowColor}
                    onClick={() => setShowShadowColorPicker(!showShadowColorPicker)}
                    style={{ backgroundColor: shadowColor, marginRight: "10px" }}
                  />
                  <div>
                    <Typography variant="subtitle2" color="#ffffffa6">
                      Color
                    </Typography>
                    <StyledColorInput
                      type="text"
                      name="variableValue"
                      value={shadowColor}
                      onChange={(event) => handleShadowColorChange(event.target.value)}
                      style={{ maxWidth: "80px", marginRight: "8px" }}
                    />
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="#ffffffa6">
                      Height
                    </Typography>
                    <StyledColorInput
                      type="text"
                      name="variableValue"
                      defaultValue={shadowHeight}
                      onChange={(event) => handleShadowSizeChange(event.target.value, true)}
                      style={{ maxWidth: "50px", marginRight: "8px" }}
                    />
                  </div>
                  <div>
                    <Typography variant="subtitle2" color="#ffffffa6">
                      Width
                    </Typography>
                    <StyledColorInput
                      type="text"
                      name="variableValue"
                      defaultValue={shadowWidth}
                      onChange={(event) => handleShadowSizeChange(event.target.value, false)}
                      style={{ maxWidth: "50px" }}
                    />
                  </div>
                  {showShadowColorPicker && (
                    <Popover>
                      <Cover onClick={() => setShowShadowColorPicker(!showShadowColorPicker)} />
                      <HexColorPicker color={shadowColor} onChange={(color) => handleShadowColorChange(color)} />
                    </Popover>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>

            {error !== "" && (
              <Alert
                variant="filled"
                severity="warning"
                sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px", maxWidth: "280px" }}
              >
                {error}
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px" }}>
            {props.editElementId && (
              <FormControlLabel
                componentsProps={{
                  typography: { color: "#ffffffa6", width: "84px" },
                }}
                control={
                  <Checkbox
                    sx={{ color: "#ffffffa6", height: "20px", width: "30px", paddingLeft: "10px", marginLeft: "20px" }}
                    onChange={() => {
                      setAutoUpdate((autoUpdate) => !autoUpdate);
                    }}
                    defaultChecked={autoUpdate}
                    value={autoUpdate}
                  />
                }
                label="Live update"
              />
            )}

            <Button
              variant="outlined"
              sx={{
                color: "#ffffffa6",
                borderColor: "#ffffffa6",
                "&:hover": { borderColor: "white" },
              }}
              onClick={handleOnClose}
            >
              Cancel
            </Button>
            <Button
              disabled={
                text === "" ||
                fontSize === "" ||
                textColor === "" ||
                shadowColor === "" ||
                shadowHeight === "" ||
                shadowWidth === "" ||
                error !== ""
                  ? true
                  : false
              }
              variant="outlined"
              sx={{
                color: "#ffffffa6",
                borderColor: "#ffffffa6",
                "&:hover": { borderColor: "white" },
                "&:disabled": {
                  borderColor: "gray",
                  color: "gray",
                },
              }}
              onClick={() => {
                handleSave(true);
              }}
            >
              {props.editElementId ? "Edit" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

const StyledColorInput = styled.input`
  width: 145px;
  padding: 6px;
  box-sizing: border-box;
  background-color: #000c17;
  color: #b0bec5;
  border: 1px solid #ffffffa6;
  border-width: 2px;
  border-radius: 5px;
`;

const ColorBox = styled.div`
  width: 50px;
  height: 50px;
  border: 2px solid #ffffffa6;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

const PreviewContainer = styled.div`
  background-color: #063053;
  color: #ffffffa6;

  padding: 5px;
  margin-bottom: 15px;

  max-height: 300px;
  overflow: auto;

  border: 3px solid #001529;

  > * {
    margin: 0 !important;
  }
`;
