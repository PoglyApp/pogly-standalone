import { Accordion, AccordionDetails, AccordionSummary, Button, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WidgetsIcon from "@mui/icons-material/Widgets";
import InfoOutlineIcon from "@mui/icons-material/InfoOutlined";
import ElementData from "../../../module_bindings/element_data";
import { insertElement } from "../../../StDB/Reducers/Insert/insertElement";
import ElementStruct from "../../../module_bindings/element_struct";
import { useContext } from "react";
import { WidgetCreationModal } from "../../Modals/WidgetCreationModal";
import { HandleElementSelectionContextMenu } from "../../../Utility/HandleContextMenu";
import { ModalContext } from "../../../Contexts/ModalContext";
import PermissionLevel from "../../../module_bindings/permission_level";
import { LayoutContext } from "../../../Contexts/LayoutContext";

interface IProps {
  elementData: ElementData[];
  strictSettings: { StrictMode: boolean; Permission?: PermissionLevel };
  contextMenu: any;
  setContextMenu: Function;
}

export const WidgetCategory = (props: IProps) => {
  const { setModals } = useContext(ModalContext);
  const layoutContext = useContext(LayoutContext);

  const showWidgetCreationModal = () => {
    setModals((oldModals: any) => [...oldModals, <WidgetCreationModal key="widgetCreation_modal" />]);
  };

  const AddElementToCanvas = (elementData: ElementData) => {
    insertElement(
      ElementStruct.WidgetElement({
        elementDataId: elementData.id,
        width: elementData.dataWidth,
        height: elementData.dataHeight,
        rawData: "",
      }),
      layoutContext.activeLayout
    );
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
        <WidgetsIcon sx={{ marginRight: "5px" }} />
        <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Widgets</span>
        {props.strictSettings.StrictMode &&
        props.strictSettings.Permission?.tag !== "Owner" &&
        props.strictSettings.Permission?.tag !== "Moderator" ? (
          <Tooltip title="Strict mode is enabled and preventing you from uploading a new Widget. Ask the instance owner!">
            <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingLeft: "5px" }} />
          </Tooltip>
        ) : (
          <></>
        )}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#000c17",
          paddingBottom: "5px",
        }}
      >
        {!props.strictSettings.StrictMode ||
        props.strictSettings.Permission?.tag === "Owner" ||
        props.strictSettings.Permission?.tag === "Moderator" ? (
          <Button
            variant="text"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              color: "#ffffffa6",
              textTransform: "initial",
              justifyContent: "left",
              width: "100%",
            }}
            onClick={showWidgetCreationModal}
          >
            Add Widget
          </Button>
        ) : (
          <></>
        )}

        {props.elementData.map((elementData: ElementData) => {
          if (elementData.dataType.tag === "WidgetElement")
            return (
              <div
                key={elementData.id}
                onContextMenu={(event: any) => {
                  HandleElementSelectionContextMenu(event, props.setContextMenu, props.contextMenu, elementData);
                }}
              >
                <Button
                  variant="text"
                  sx={{
                    color: "#ffffffa6",
                    textTransform: "initial",
                    justifyContent: "left",
                    width: "100%",
                  }}
                  onClick={() => AddElementToCanvas(elementData)}
                  data-widget-selection-button={elementData.id}
                >
                  {elementData.name}
                </Button>
                <br />
              </div>
            );

          return null;
        })}
      </AccordionDetails>
    </Accordion>
  );
};
