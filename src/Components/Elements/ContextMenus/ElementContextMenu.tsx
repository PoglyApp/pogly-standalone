import { Divider, FormControl, Menu, MenuItem, Paper, Select, Slider } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import Elements from "../../../module_bindings/elements";
import { CanvasElementType } from "../../../Types/General/CanvasElementType";
import LockIcon from "@mui/icons-material/Lock";
import {
  handleDelete,
  handleFlipElement,
  handleLocked,
  handleResetTransform,
  handleTransparency,
  handleWidgetToggle,
  TransformType,
} from "../../../Utility/ContextMenuMethods";
import { ModalContext } from "../../../Contexts/ModalContext";
import { TextCreationModal } from "../../Modals/TextCreationModal";
import { WidgetCreationModal } from "../../Modals/WidgetCreationModal";
import { WidgetVariableType } from "../../../Types/General/WidgetVariableType";
import WidgetElement from "../../../module_bindings/widget_element";
import ElementData from "../../../module_bindings/element_data";
import { DebugLogger } from "../../../Utility/DebugLogger";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
  canvasElements: CanvasElementType[];
  setTransformSelect: Function;
  setSelected: Function;
  setSelectoTargets: Function;
}

export const ElementContextMenu = (props: IProps) => {
  const { setModals } = useContext(ModalContext);

  const selectedElement: Elements | null = props.contextMenu ? props.contextMenu.element : null;

  const [transformEdit, setTransformEdit] = useState("Scale");
  const [showFlipMenuItem, setFlipShowMenuItem] = useState(true);
  const [showResetTransformMenuItem, setShowResetTransformMenuItem] = useState(true);
  const [showTransparencyMenuItem, setShowTransparencyMenuItem] = useState(true);

  const [showExamine, setShowExamine] = useState(false);

  const [widgetVariables, setWidgetVariables] = useState<WidgetVariableType[] | null>(null);
  const locked = document.getElementById(selectedElement?.id.toString() || "null")?.getAttribute("data-locked");

  let element: Elements | undefined;
  if (selectedElement) element = Elements.findById(selectedElement.id);

  useEffect(() => {
    if (selectedElement?.element.tag !== "WidgetElement") return;

    DebugLogger("Setting widget data");

    const widgetElement: WidgetElement = Elements.findById(selectedElement.id)?.element.value as WidgetElement;

    if (widgetElement.rawData === "") {
      const elementData = ElementData.findById(widgetElement.elementDataId);

      if (!elementData) return;

      const widgetCodeJson = JSON.parse(elementData.data);
      const toggleVariables = widgetCodeJson.variables.filter(
        (variable: WidgetVariableType) => variable.variableType === 3
      );

      setWidgetVariables(() => (toggleVariables.length > 0 ? toggleVariables : null));
    } else {
      const widgetCodeJson = JSON.parse(widgetElement.rawData);
      const toggleVariables = widgetCodeJson.variables.filter(
        (variable: WidgetVariableType) => variable.variableType === 3
      );

      setWidgetVariables(() => (toggleVariables.length > 0 ? toggleVariables : null));
    }
  }, [props.contextMenu, selectedElement?.element.tag, selectedElement?.id]);

  const handleClose = () => {
    DebugLogger("Handling close context");
    props.setContextMenu(null);
  };

  const openEditModal = () => {
    if (selectedElement?.element.tag === "TextElement") {
      DebugLogger("Opening text creation modal");
      setModals((oldModals: any) => [
        ...oldModals,
        <TextCreationModal key="textCreation_modal" editElementId={selectedElement.id} />,
      ]);
    } else {
      DebugLogger("Opening widget creation modal");
      setModals((oldModals: any) => [
        ...oldModals,
        <WidgetCreationModal key="widgetCreation_modal" editElementId={selectedElement?.id} />,
      ]);
    }
  };

  return (
    <Menu
      open={props.contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        props.contextMenu !== null
          ? { top: props.contextMenu.mouseY - 5, left: props.contextMenu.mouseX - 10 }
          : undefined
      }
      transitionDuration={{ enter: 0, exit: 0 }}
      MenuListProps={{ onMouseLeave: handleClose }}
    >
      {/* <StyledMenuItem
        sx={{
          paddingLeft: "0px",
          paddingRight: "0px",
          paddingTop: "15px",
        }}
      >
        <FormControl fullWidth>
          <InputLabel sx={{ color: "#ffffffa6", "&.Mui-focused": { color: "#ffffffa6" } }}>Edit Transform</InputLabel>
          <StyledSelect
            label="Edit transform"
            value={transformEdit !== "" ? transformEdit : "Scale"}
            onChange={(event: any) => setTransformEdit(event.target.value)}
            variant={"outlined"}
            sx={{
              ".MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
              ".MuiSvgIcon-root": { fill: "#ffffffa6" },
            }}
          >
            <MenuItem value={"Scale"} onClick={() => handleEditTransform(TransformType.Scale, props.setTransformSelect)}>
              Scale
            </MenuItem>
            <MenuItem value={"Warp"} onClick={() => handleEditTransform(TransformType.Warp, props.setTransformSelect)}>
              Warp
            </MenuItem>
            <MenuItem value={"Clip"} onClick={() => handleEditTransform(TransformType.Clip, props.setTransformSelect)}>
              Clip
            </MenuItem>
          </StyledSelect>
        </FormControl>
      </StyledMenuItem> */}

      {selectedElement && (
        <StyledMenuItem sx={{ paddingLeft: "0px", paddingRight: "0px" }}>
          <FormControl fullWidth>
            <StyledSelect
              value={"Reset transform"}
              variant={"standard"}
              sx={{
                ".MuiStandardInput-notchedOutline": { borderColor: "#ffffffa6" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
                ".MuiSvgIcon-root": { fill: "#ffffffa6" },
                marginRight: "5px !important",
                marginTop: "0px !important",
              }}
              onOpen={(prev) => setShowResetTransformMenuItem(false)}
              onClose={(prev) => setShowResetTransformMenuItem(true)}
            >
              <MenuItem value={"Reset transform"} style={{ display: showResetTransformMenuItem ? "block" : "none" }}>
                Reset
              </MenuItem>
              <StyledMenuItem
                value={"Scale"}
                onClick={() => handleResetTransform(selectedElement, TransformType.Scale, handleClose)}
              >
                Scale
              </StyledMenuItem>
              <StyledMenuItem
                value={"Rotation"}
                onClick={() => handleResetTransform(selectedElement, TransformType.Rotation, handleClose)}
              >
                Rotation
              </StyledMenuItem>
              {/* <StyledMenuItem
              value={"Warp"}
              onClick={() => handleResetTransform(selectedElement, TransformType.Warp, handleClose)}
            >
              Warp
            </StyledMenuItem>
            <StyledMenuItem
              value={"Clip"}
              onClick={() => handleResetTransform(selectedElement, TransformType.Clip, handleClose)}
            >
              Clip
            </StyledMenuItem> */}
            </StyledSelect>
          </FormControl>
        </StyledMenuItem>
      )}

      {selectedElement && (
        <StyledMenuItem sx={{ paddingLeft: "0px", paddingRight: "0px" }}>
          <FormControl fullWidth>
            <StyledSelect
              value={"Flip"}
              variant={"standard"}
              sx={{
                ".MuiStandardInput-notchedOutline": { borderColor: "#ffffffa6" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
                ".MuiSvgIcon-root": { fill: "#ffffffa6" },
                marginRight: "5px !important",
                marginTop: "0px !important",
              }}
              onOpen={(prev) => setFlipShowMenuItem(false)}
              onClose={(prev) => setFlipShowMenuItem(true)}
            >
              <MenuItem value={"Flip"} style={{ display: showFlipMenuItem ? "block" : "none" }}>
                Flip
              </MenuItem>
              <StyledMenuItem
                value={"Vertical"}
                onClick={() => {
                  handleFlipElement(true, selectedElement, handleClose);
                }}
              >
                Vertical
              </StyledMenuItem>
              <StyledMenuItem
                value={"Horizontal"}
                onClick={() => {
                  handleFlipElement(false, selectedElement, handleClose);
                }}
              >
                Horizontal
              </StyledMenuItem>
            </StyledSelect>
          </FormControl>
        </StyledMenuItem>
      )}

      {selectedElement && (
        <StyledMenuItem sx={{ paddingLeft: "0px", paddingRight: "0px" }}>
          <FormControl fullWidth>
            <StyledSelect
              value={"Transparency"}
              variant={"standard"}
              sx={{
                ".MuiStandardInput-notchedOutline": { borderColor: "#ffffffa6" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
                ".MuiSvgIcon-root": { fill: "#ffffffa6" },
                marginRight: "5px !important",
                marginTop: "0px !important",
                overflow: "visible !important",
              }}
              onOpen={(prev) => setShowTransparencyMenuItem(false)}
            >
              <MenuItem value={"Transparency"} style={{ display: showTransparencyMenuItem ? "block" : "none" }}>
                Transparency
              </MenuItem>
              <StyledMenuItem value={"Vertical"}>
                <Slider
                  size="small"
                  defaultValue={
                    Elements.findById(selectedElement.id)?.transparency.valueOf() || selectedElement.transparency
                  }
                  aria-label="Small"
                  valueLabelDisplay="on"
                  onChange={(event, number) => handleTransparency(selectedElement, number)}
                />
              </StyledMenuItem>
            </StyledSelect>
          </FormControl>
        </StyledMenuItem>
      )}

      {(selectedElement?.element.tag === "TextElement" || selectedElement?.element.tag === "WidgetElement") && (
        <StyledMenuItem onClick={openEditModal}>Edit</StyledMenuItem>
      )}

      {selectedElement?.element.tag === "WidgetElement" && widgetVariables && (
        <StyledMenuItem sx={{ paddingLeft: "0px", paddingRight: "0px" }}>
          <FormControl fullWidth>
            <StyledSelect
              value={"Toggles"}
              variant={"standard"}
              sx={{
                ".MuiStandardInput-notchedOutline": { borderColor: "#ffffffa6" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
                ".MuiSvgIcon-root": { fill: "#ffffffa6" },
                marginRight: "5px !important",
                marginTop: "0px !important",
              }}
              onOpen={(prev) => setFlipShowMenuItem(false)}
              onClose={(prev) => setFlipShowMenuItem(true)}
            >
              <MenuItem value={"Toggles"} style={{ display: showFlipMenuItem ? "block" : "none" }}>
                Toggles
              </MenuItem>

              {widgetVariables.map((variable: WidgetVariableType) => {
                return (
                  <StyledMenuItem
                    value={variable.variableName}
                    onClick={() => {
                      handleWidgetToggle(selectedElement.id, variable, handleClose);
                    }}
                    key={variable.variableName + "_variable"}
                  >
                    {variable.variableName}
                  </StyledMenuItem>
                );
              })}
            </StyledSelect>
          </FormControl>
        </StyledMenuItem>
      )}

      {selectedElement && (
        <StyledMenuItem
          onClick={() => {
            handleLocked(selectedElement, handleClose);
          }}
        >
          {locked === "true" ? "Locked" : "Lock"}
          {locked === "true" && <LockIcon sx={{ fontSize: "20px", paddingLeft: "5px" }} />}
        </StyledMenuItem>
      )}

      <StyledMenuItem onClick={() => setShowExamine((showExamine) => !showExamine)}>Show details</StyledMenuItem>

      {showExamine && element && element.element.tag === "ImageElement" && element.element.value.imageElementData.tag === "ElementDataId" &&(
        <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          Image: {ElementData.findById(element.element.value.imageElementData.value)?.name || ""}
        </Paper>
      )}
      {showExamine && element && element.element.tag === "ImageElement" && element.element.value.imageElementData.tag === "RawData" &&(
        <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          Image: {/7tv|betterttv|tenor/.test(element.element.value.imageElementData.value) ? "7TV/BTTV/Tenor" : "RawData"}
        </Paper>
      )}
      {showExamine && element && (
        <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          Edited by: {element.lastEditedBy}
        </Paper>
      )}
      {showExamine && element && (
        <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          Added by: {element.placedBy}
        </Paper>
      )}

      <Divider component="li" variant="fullWidth" sx={{ border: "solid 1px #001529e6" }} />

      {selectedElement && (
        <StyledDeleteMenuItem
          onClick={() => {
            handleDelete(selectedElement, props.setSelected, props.setSelectoTargets, handleClose);
          }}
        >
          Delete
        </StyledDeleteMenuItem>
      )}
    </Menu>
  );
};

const StyledMenuItem = styled(MenuItem)`
  &:hover {
    background-color: #001529;
  }

  padding-left: 5px;

  margin-left: 5px;
  margin-right: 5px;
`;

const StyledDeleteMenuItem = styled(MenuItem)`
  color: #d82b2b;

  margin-left: 5px;
  margin-right: 5px;

  padding-left: 5px;

  &:hover {
    color: #960000;
  }
`;

const StyledSelect = styled(Select)`
  color: #ffffffa6;
  margin-left: 0px;

  &:after {
    border-width: 0;
  }

  &:before {
    border-width: 0;
  }
`;
