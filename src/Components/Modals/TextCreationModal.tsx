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
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import { parseCustomCss } from "../../Utility/ParseCustomCss";

interface IProps {
  editElementId?: number;
}

const fonts = ["Roboto", "Tiny5", "Lato", "Ubuntu", "Merriweather", "Bebas Neue", "Anton"];

const hightlightWithLineNumbers = (input: string, language: any, languageString: string) =>
  highlight(input, language, languageString)
    .split("\n")
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");

export const TextCreationModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const layoutContext = useContext(LayoutContext);

  const [text, setText] = useState<string>("");

  const [selectedFont, setSelectedFont] = useState<string>("Roboto");
  const [useCustomFont, setUseCustomFont] = useState<boolean>(false);
  const [customFont, setCustomFont] = useState<string>("");
  const [fontSize, setFontSize] = useState<string>("12");

  const [shadow, setShadow] = useState<boolean>(false);
  const [shadowColor, setShadowColor] = useState<string>("#000000");
  const [shadowHeight, setShadowHeight] = useState<string>("0");
  const [shadowWidth, setShadowWidth] = useState<string>("0");
  const [shadowBlur, setShadowBlur] = useState<string>("0");

  const [outline, setOutline] = useState<boolean>(false);
  const [outlineColor, setOutlineColor] = useState<string>("#000000");
  const [outlineSize, setOutlineSize] = useState<string>("0");

  const [textColor, setTextColor] = useState<string>("#FFFFFF");

  const [showTextColorPicker, setShowTextColorPicker] = useState<boolean>(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState<boolean>(false);
  const [showOutlineColorPicker, setShowOutlineColorPicker] = useState<boolean>(false);

  const [customCss, setCustomCss] = useState<string>("");

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
    setFontSize(textStruct.size.toString());
    setTextColor(textStruct.color);

    // This is here to not brick text made before 0.2.0 version
    if (!textStruct.css) return setShowModal(true);

    const css = JSON.parse(textStruct.css);

    const shadowVariables = css.shadow.split(" ");
    const sHeight = shadowVariables[0].replace("px", "");
    const sWidth = shadowVariables[1].replace("px", "");
    const sBlur = shadowVariables[2].replace("px", "");

    setShadowHeight(sHeight);
    setShadowWidth(sWidth);
    setShadowBlur(sBlur);
    setShadowColor(shadowVariables[3]);

    if (sHeight !== "0" || sWidth !== "0") {
      setShadow(true);
    }

    const outlineVariables = css.outline.split(" ");
    const oSize = outlineVariables[0].replace("px", "");

    setOutlineSize(oSize);
    setOutlineColor(outlineVariables[1]);

    if (oSize !== "0") setOutline(true);

    setCustomCss(css.custom);

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

  const handleOutlineColorChange = (color: any) => {
    DebugLogger("Outline color updated");
    if (color.length < 3) {
      DebugLogger("Outline hex not long enough");
      setError("Outline hex has to be at least 3 characters long.");
    } else {
      setError("");
    }

    setOutlineColor(color);
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
      return setError("Shadow size has to be a number.");
    }

    if (height) setShadowHeight(newShadowSize);
    else setShadowWidth(newShadowSize);

    setError("");
  };

  const handleOutlineSizeChange = (newOutlineSize: any) => {
    const regex = new RegExp("^[0-9]+$");

    if (newOutlineSize.length < 1) {
      DebugLogger("Outline field size empty");
      setOutlineSize("");

      return setError("Outline size field cannot be blank.");
    }

    if (!regex.test(newOutlineSize)) {
      DebugLogger("Outline size not a number");
      setOutlineSize("");

      return setError("Outline size has to be a number.");
    }

    setOutlineSize(newOutlineSize);

    setError("");
  };

  const handleShadowBlurChange = (newBlur: any) => {
    const regex = new RegExp("^[0-9]+$");

    if (newBlur.length < 1) {
      DebugLogger("Blur field size empty");
      return setError("Blur size cannot be blank.");
    }

    if (!regex.test(newBlur)) {
      DebugLogger("Blur size not a number");
      return setError("Shadow blur has to be a number.");
    }

    setError("");
    setShadowBlur(newBlur);
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
      size: parseInt(fontSize),
      color: textColor,
      font: useFont,
      css: JSON.stringify({
        shadow: `${shadowHeight}px ${shadowWidth}px ${shadowBlur}px ${shadowColor}`,
        outline: `${outlineSize}px ${outlineColor}`,
        custom: customCss,
      }),
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
                fontSize: fontSize ? parseInt(fontSize) / 1.5 : 1,
                fontFamily: !useCustomFont ? selectedFont : "inherit",
                textShadow: `${shadowHeight}px ${shadowWidth}px ${shadowBlur}px ${shadowColor}`,
                WebkitTextStroke: `${outlineSize}px ${outlineColor}`,
                ...parseCustomCss(customCss),
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
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6" },
                  }}
                  control={
                    <Checkbox
                      onChange={() => {
                        if (shadow) {
                          setShadow(false);
                          setShadowWidth("0");
                          setShadowHeight("0");
                        } else {
                          setShadow(true);
                          setShadowWidth("2");
                          setShadowHeight("2");
                        }
                      }}
                      checked={shadow}
                      sx={{ color: "#ffffffa6" }}
                    />
                  }
                  label="Text Shadow"
                />

                {shadow && (
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
                        style={{ maxWidth: "50px", marginRight: "8px" }}
                      />
                    </div>
                    <div>
                      <Typography variant="subtitle2" color="#ffffffa6">
                        Blur
                      </Typography>
                      <StyledColorInput
                        type="text"
                        name="variableValue"
                        defaultValue={shadowBlur}
                        onChange={(event) => handleShadowBlurChange(event.target.value)}
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
                )}

                <br />
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6" },
                  }}
                  control={
                    <Checkbox
                      onChange={() => {
                        if (outline) {
                          setOutline(false);
                          setOutlineSize("0");
                        } else {
                          setOutline(true);
                          setOutlineSize("1");
                        }
                      }}
                      checked={outline}
                      sx={{ color: "#ffffffa6" }}
                    />
                  }
                  label="Text Outline"
                />

                {outline && (
                  <div style={{ display: "flex" }}>
                    <ColorBox
                      color={outlineColor}
                      onClick={() => setShowOutlineColorPicker(!showOutlineColorPicker)}
                      style={{ backgroundColor: outlineColor, marginRight: "10px" }}
                    />
                    <div>
                      <Typography variant="subtitle2" color="#ffffffa6">
                        Color
                      </Typography>
                      <StyledColorInput
                        type="text"
                        name="variableValue"
                        value={outlineColor}
                        onChange={(event) => handleOutlineColorChange(event.target.value)}
                        style={{ maxWidth: "80px", marginRight: "8px" }}
                      />
                    </div>
                    <div>
                      <Typography variant="subtitle2" color="#ffffffa6">
                        Size
                      </Typography>
                      <StyledColorInput
                        type="text"
                        name="variableValue"
                        defaultValue={outlineSize}
                        onChange={(event) => handleOutlineSizeChange(event.target.value)}
                        style={{ maxWidth: "50px", marginRight: "8px" }}
                      />
                    </div>
                    {showOutlineColorPicker && (
                      <Popover>
                        <Cover onClick={() => setShowOutlineColorPicker(!showOutlineColorPicker)} />
                        <HexColorPicker color={outlineColor} onChange={(color) => handleOutlineColorChange(color)} />
                      </Popover>
                    )}
                  </div>
                )}
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
                <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Custom css</span>
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
                <StyledEditor
                  value={customCss}
                  onValueChange={(code) => setCustomCss(code)}
                  highlight={(code) => hightlightWithLineNumbers(code, languages.css, "css")}
                  padding={10}
                  textareaId="codeArea"
                  className="editor"
                />
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

const StyledEditor = styled(Editor)`
  font-family: "Fira code", "Fira Mono", monospace;
  font-size: 12px;
  outline: 0px;
  background-color: #1f1f1f;
  color: #9cdcfe;
  margin-top: 10px;
`;
