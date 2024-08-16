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

interface IProps {
  editElementId?: number;
}

const fonts = ["Roboto", "Tiny5", "Lato", "Ubuntu", "Merriweather", "Bebas Neue", "Anton"];

export const TextCreationModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const layoutContext = useContext(LayoutContext);

  const [text, setText] = useState<string>("");
  const [font, setFont] = useState<string>("Roboto");
  const [fontSize, setFontSize] = useState<string>("12");
  const [color, setColor] = useState<string>("#FFFFFF");
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);

  const [showPicker, setShowPicker] = useState<boolean>(false);
  const colorInput = useRef<any>();

  const [error, setError] = useState<string>("");

  const [showModal, setShowModal] = useState<Boolean>(false);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    if (!props.editElementId) return setShowModal(true);

    const textElement = Elements.findById(props.editElementId);
    if (!textElement) return;

    const textStruct: TextElement = textElement.element.value as TextElement;

    setText(textStruct.text);
    setFontSize(StdbToViewportFontSize(textStruct.size).fontSize.toString());
    setColor(textStruct.color);
    setFont(textStruct.font);

    setShowModal(true);
  }, [props.editElementId]);

  const handleTextChange = (newText: any) => {
    if (newText.length < 1) {
      setText("");
      return setError("Text has to be at least 1 characters long.");
    }

    setText(newText);
    setError("");

    if (props.editElementId) {
      UpdateTextElementTextReducer.call(props.editElementId, newText);
    }
  };

  const HandleFontSizeChange = (size: any) => {
    const regex = new RegExp("^[0-9]+$");

    if (size.length < 1) {
      setFontSize("");
      return setError("Font size cannot be blank.");
    }

    if (!regex.test(size)) {
      setFontSize("");
      return setError("Font size has to be a number.");
    }

    setFontSize(size);
    setError("");
  };

  const handleColorChange = (color: any) => {
    if (color.length < 3) {
      setError("Color hex has to be at least 3 characters long.");
    } else {
      setError("");
    }

    setColor(color);
  };

  const handleOnClose = () => {
    closeModal("textCreation_modal", modals, setModals);
  };

  const handleSave = (close: boolean) => {
    const textElement: ElementStruct = ElementStruct.TextElement({
      text: text,
      size: ViewportToStdbFontSize(parseInt(fontSize)).fontSize,
      color: color,
      font: font,
    });

    if (!props.editElementId) {
      insertElement(textElement, layoutContext!.activeLayout);
    } else {
      updateTextElement(props.editElementId!, textElement);
    }

    if (close) handleOnClose();
  };

  if (isOverlay) return <></>;

  return (
    <>
      {showModal && (
        <Dialog open={true} onClose={handleOnClose} sx={{ "* > .MuiPaper-root": { overflow: "visible" } }}>
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>
            {props.editElementId ? "Edit text" : "Add text"}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            <FormGroup sx={{ gap: "20px" }}>
              <StyledInput
                focused={true}
                label="Text"
                color="#ffffffa6"
                onChange={(text: any) => handleTextChange(text)}
                defaultValue={text}
              />

              {props.editElementId ? (
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6" },
                  }}
                  control={
                    <Checkbox
                      sx={{ color: "#ffffffa6", height: "20px" }}
                      onChange={() => {
                        setAutoUpdate((autoUpdate) => !autoUpdate);
                      }}
                      defaultChecked={autoUpdate}
                      value={autoUpdate}
                    />
                  }
                  label="Live update"
                />
              ) : (
                <></>
              )}

              <FormControl fullWidth sx={{ "&:hover": { borderColor: "#ffffffa6 !important" } }}>
                <InputLabel id="fontSelectLabel" sx={{ color: "#ffffffa6" }}>
                  Font
                </InputLabel>
                <Select
                  labelId="fontSelectLabel"
                  id="fontSelectLabel"
                  value={font}
                  label="Font"
                  onChange={(event) => setFont(event.target.value)}
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
              </FormControl>
              <StyledInput
                focused={false}
                label="Font size"
                color="#ffffffa6"
                onChange={(text: any) => HandleFontSizeChange(text)}
                defaultValue={fontSize}
              />

              <div style={{ display: "flex" }}>
                <ColorBox
                  color={color}
                  onClick={() => setShowPicker(!showPicker)}
                  style={{ backgroundColor: color, marginRight: "10px" }}
                />
                <div>
                  <Typography variant="subtitle2" color="#ffffffa6">
                    Color
                  </Typography>
                  <StyledColorInput
                    type="text"
                    name="variableValue"
                    value={color}
                    onChange={(event) => handleColorChange(event.target.value)}
                  />
                </div>
                {showPicker && (
                  <Popover>
                    <Cover onClick={() => setShowPicker(!showPicker)} />
                    <HexColorPicker color={color} onChange={(color) => handleColorChange(color)} />
                  </Popover>
                )}
              </div>
            </FormGroup>

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
              disabled={text === "" || fontSize === "" || color === "" || error !== "" ? true : false}
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
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  background-color: #0a2a47;
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
