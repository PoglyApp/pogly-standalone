import { Divider, FormControl, InputLabel, Menu, MenuItem, Paper, Select, Slider, Tooltip } from "@mui/material";
import { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { CanvasElementType } from "../../../Types/General/CanvasElementType";
import LockIcon from "@mui/icons-material/Lock";
import CheckIcon from "@mui/icons-material/Check";
import {
  handleDelete,
  handleFlipElement,
  handleHide,
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
import { DebugLogger } from "../../../Utility/DebugLogger";
import { SpacetimeContext } from "../../../Contexts/SpacetimeContext";
import InfoOutlineIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { UpdateElementSourceModal } from "../../Modals/UpdateElementSourceModal";
import { Elements, WidgetElement } from "../../../module_bindings";
import { PermissionTypes } from "../../../Types/General/PermissionType";
import { getPermissions } from "../../../Utility/PermissionsHelper";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
  canvasElements: CanvasElementType[];
  transformSelect: any;
  setTransformSelect: Function;
  setSelected: Function;
  setSelectoTargets: Function;
}

export const ElementContextMenu = (props: IProps) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const { setModals } = useContext(ModalContext);

  const selectedElement: Elements | null = props.contextMenu ? props.contextMenu.element : null;

  const strictMode: boolean = spacetimeDB.Client.db.config.version.find(0)!.strictMode;
  const permissions: PermissionTypes[] = getPermissions(spacetimeDB, spacetimeDB.Identity.identity);

  const [showTransformEditMenuItem, setShowTransformEditMenuItem] = useState(true);
  const [showFlipMenuItem, setFlipShowMenuItem] = useState(true);
  const [showResetTransformMenuItem, setShowResetTransformMenuItem] = useState(true);
  const [showTransparencyMenuItem, setShowTransparencyMenuItem] = useState(true);
  const [transparency, setTransparency] = useState<number>(0);

  const [showExamine, setShowExamine] = useState(false);

  const [widgetVariables, setWidgetVariables] = useState<WidgetVariableType[] | null>(null);
  const locked = document.getElementById(selectedElement?.id.toString() || "null")?.getAttribute("data-locked");

  let element: Elements | undefined;
  if (selectedElement) element = spacetimeDB.Client.db.elements.id.find(selectedElement.id);

  const hasElementBeenWarped = element?.transform.includes("matrix");

  useEffect(() => {
    if (selectedElement)
      setTransparency(spacetimeDB.Client.db.elements.id.find(selectedElement.id)!.transparency.valueOf());
    if (selectedElement?.element.tag !== "WidgetElement") return;

    DebugLogger("Setting widget data");

    const widgetElement: WidgetElement = spacetimeDB.Client.db.elements.id.find(selectedElement.id)?.element
      .value as WidgetElement;

    if (widgetElement.rawData === "") {
      const elementData = spacetimeDB.Client.db.elementData.id.find(widgetElement.elementDataId);

      if (!elementData) return;

      const widgetCodeJson = JSON.parse(elementData.data);
      const toggleVariables = widgetCodeJson.variables.filter(
        (variable: WidgetVariableType) => variable.variableType === 3
      );

      setWidgetVariables(() => (toggleVariables.length > 0 ? toggleVariables : null));
    } else {
      const widgetCodeJson = JSON.parse(widgetElement.rawData);

      if (!widgetCodeJson.variables) return;

      const toggleVariables = widgetCodeJson.variables.filter(
        (variable: WidgetVariableType) => variable.variableType === 3
      );

      setWidgetVariables(() => (toggleVariables.length > 0 ? toggleVariables : null));
    }
  }, [props.contextMenu, selectedElement?.element.tag, selectedElement?.id, selectedElement, spacetimeDB.Client]);

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

  const openUpdateSourceModal = () => {
    DebugLogger("Opening update source modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <UpdateElementSourceModal key="textCreation_modal" selectedElement={selectedElement!} />,
    ]);
  };

  if (!selectedElement) return <></>;

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
      className="canvas-font"
    >
      <StyledMenuItem sx={{ paddingLeft: "0px", paddingRight: "0px" }}>
        <FormControl fullWidth>
          <StyledSelect
            value={"Edit transform"}
            variant={"standard"}
            sx={{
              ".MuiStandardInput-notchedOutline": { borderColor: "#ffffffa6" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
              ".MuiSvgIcon-root": { fill: "#ffffffa6" },
              marginRight: "5px !important",
              marginTop: "0px !important",
            }}
            onOpen={(prev) => setShowTransformEditMenuItem(false)}
            onClose={(prev) => setShowTransformEditMenuItem(true)}
          >
            <MenuItem value={"Edit transform"} style={{ display: showTransformEditMenuItem ? "block" : "none" }}>
              Edit
            </MenuItem>
            <Tooltip
              title="Scale cannot be modified if the element has been warped. Reset warp to scale the element."
              disableHoverListener={!hasElementBeenWarped}
              placement="top"
            >
              <StyledMenuItem
                value={"Scale"}
                onClick={() => {
                  if (!hasElementBeenWarped) props.setTransformSelect({ size: true, warp: false, clip: false });
                  handleClose();
                }}
                style={hasElementBeenWarped ? { cursor: "not-allowed", color: "#364f68" } : {}}
              >
                Scale
                {props.transformSelect.size && <CheckIcon sx={{ color: "green", marginLeft: "3px" }} />}
                {hasElementBeenWarped && (
                  <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingLeft: "5px" }} />
                )}
              </StyledMenuItem>
            </Tooltip>

            <StyledMenuItem
              value={"Clip"}
              onClick={() => {
                props.setTransformSelect({ size: false, warp: false, clip: true });
                handleClose();
              }}
            >
              Clip
              {props.transformSelect.clip && <CheckIcon sx={{ color: "green", marginLeft: "3px" }} />}
            </StyledMenuItem>
            <StyledMenuItem
              value={"Wrap"}
              onClick={() => {
                props.setTransformSelect({ size: false, warp: true, clip: false });
                handleClose();
              }}
            >
              Warp
              {props.transformSelect.warp && <CheckIcon sx={{ color: "green", marginLeft: "3px" }} />}
            </StyledMenuItem>
          </StyledSelect>
        </FormControl>
      </StyledMenuItem>

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
              onClick={() =>
                handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Scale, handleClose)
              }
            >
              Scale
            </StyledMenuItem>
            <StyledMenuItem
              value={"Rotation"}
              onClick={() =>
                handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Rotation, handleClose)
              }
            >
              Rotation
            </StyledMenuItem>
            <StyledMenuItem
              value={"Clip"}
              onClick={() => handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Clip, handleClose)}
            >
              Clip
            </StyledMenuItem>
            <StyledMenuItem
              value={"Warp"}
              onClick={() => handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Warp, handleClose)}
            >
              Warp
            </StyledMenuItem>
            <StyledMenuItem
              value={"All"}
              onClick={() => {
                handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Scale, () => {});
                handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Rotation, () => {});
                handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Clip, () => {});
                handleResetTransform(spacetimeDB.Client, selectedElement, TransformType.Warp, () => {});
                handleClose();
              }}
            >
              All
            </StyledMenuItem>
          </StyledSelect>
        </FormControl>
      </StyledMenuItem>

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
                handleFlipElement(spacetimeDB.Client, true, selectedElement, handleClose);
              }}
            >
              Vertical
            </StyledMenuItem>
            <StyledMenuItem
              value={"Horizontal"}
              onClick={() => {
                handleFlipElement(spacetimeDB.Client, false, selectedElement, handleClose);
              }}
            >
              Horizontal
            </StyledMenuItem>
          </StyledSelect>
        </FormControl>
      </StyledMenuItem>

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
                value={transparency}
                aria-label="Small"
                valueLabelDisplay="on"
                onChange={(event, number) =>
                  handleTransparency(spacetimeDB.Client, selectedElement, setTransparency, number)
                }
              />
            </StyledMenuItem>
          </StyledSelect>
        </FormControl>
      </StyledMenuItem>

      {(selectedElement.element.tag === "TextElement" || selectedElement.element.tag === "WidgetElement") && (
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
                      handleWidgetToggle(spacetimeDB.Client, selectedElement.id, variable, handleClose);
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

      <StyledMenuItem
        onClick={() => {
          const number = transparency > 0 ? 0 : 100;
          handleHide(spacetimeDB.Client, selectedElement, setTransparency, number);
        }}
      >
        {transparency > 0 ? "Hide" : "Show"}
        {transparency > 0 ? (
          <VisibilityOffIcon sx={{ fontSize: "20px", paddingLeft: "5px" }} />
        ) : (
          <VisibilityIcon sx={{ fontSize: "20px", paddingLeft: "5px" }} />
        )}
      </StyledMenuItem>

      <StyledMenuItem
        onClick={() => {
          handleLocked(spacetimeDB.Client, selectedElement, handleClose);
        }}
      >
        {locked === "true" ? "Locked" : "Lock"}
        {locked === "true" && <LockIcon sx={{ fontSize: "20px", paddingLeft: "5px" }} />}
      </StyledMenuItem>

      <StyledMenuItem onClick={() => setShowExamine((showExamine) => !showExamine)}>Show details</StyledMenuItem>

      {showExamine && element && (
        <div>
          {element.element.tag === "ImageElement" && element.element.value.imageElementData.tag === "ElementDataId" && (
            <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
              Image:{" "}
              {spacetimeDB.Client.db.elementData.id.find(element.element.value.imageElementData.value)?.name || ""}
            </Paper>
          )}

          {element.element.tag === "ImageElement" && element.element.value.imageElementData.tag === "RawData" && (
            <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
              Image:{" "}
              {/7tv|betterttv|tenor/.test(element.element.value.imageElementData.value) ? "7TV/BTTV/Tenor" : "RawData"}
            </Paper>
          )}

          <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
            Edited by: {element.lastEditedBy}
          </Paper>

          <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
            Added by: {element.placedBy}
          </Paper>

          <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
            ID: {element.id}
          </Paper>
        </div>
      )}

      <Divider component="li" variant="fullWidth" sx={{ border: "solid 1px #001529e6" }} />
      {selectedElement.element.tag === "ImageElement" && (
        <div>
          {strictMode && !permissions ? (
            <Tooltip title="Strict mode is enabled and preventing you from updating the source. Ask the instance owner!">
              <StyledDisabledMenuItem>
                <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingRight: "5px" }} />
                Update source
              </StyledDisabledMenuItem>
            </Tooltip>
          ) : (
            <StyledMenuItem onClick={openUpdateSourceModal}>Update source</StyledMenuItem>
          )}
        </div>
      )}

      {strictMode && !permissions ? (
        <Tooltip title="Strict mode is enabled and preventing you from deleting elements. Ask the instance owner!">
          <StyledDisabledDeleteMenuItem>
            <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingRight: "5px" }} />
            Delete
          </StyledDisabledDeleteMenuItem>
        </Tooltip>
      ) : (
        <StyledDeleteMenuItem
          onClick={() => {
            handleDelete(spacetimeDB.Client, selectedElement, props.setSelected, props.setSelectoTargets, handleClose);
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
    background-color: #001529 !important;
  }

  padding-left: 5px !important;

  margin-left: 5px !important;
  margin-right: 5px !important;
`;

const StyledDeleteMenuItem = styled(MenuItem)`
  color: #d82b2b !important;

  margin-left: 5px !important;
  margin-right: 5px !important;

  padding-left: 5px !important;

  &:hover {
    color: #960000 !important;
  }
`;

const StyledDisabledDeleteMenuItem = styled(MenuItem)`
  color: #681c1c !important;

  margin-left: 5px !important;
  margin-right: 5px !important;

  padding-left: 5px !important;

  cursor: not-allowed !important;
`;

const StyledDisabledMenuItem = styled(MenuItem)`
  color: #ffffff75 !important;

  margin-left: 5px !important;
  margin-right: 5px !important;

  padding-left: 5px !important;

  cursor: not-allowed !important;
`;

const StyledSelect = styled(Select)`
  color: #ffffffa6 !important;
  margin-left: 0px !important;

  &:after {
    border-width: 0 !important;
  }

  &:before {
    border-width: 0 !important;
  }
`;
