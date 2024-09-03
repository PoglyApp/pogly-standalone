import { Menu, MenuItem, Paper } from "@mui/material";
import { useContext, useState } from "react";
import styled from "styled-components";
import { handleDeleteElementData } from "../../../Utility/ContextMenuMethods";
import ElementData from "../../../module_bindings/element_data";
import { ModalContext } from "../../../Contexts/ModalContext";
import { WidgetCreationModal } from "../../Modals/WidgetCreationModal";
import { DebugLogger } from "../../../Utility/DebugLogger";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const ElementSelectionContextMenu = (props: IProps) => {
  const { setModals } = useContext(ModalContext);

  const selectedElementData: ElementData | null = props.contextMenu ? props.contextMenu.elementData : null;

  const [showExamine, setShowExamine] = useState(false);

  const handleClose = () => {
    DebugLogger("Handling close context menu");
    props.setContextMenu(null);
  };

  const handleEditWidget = () => {
    DebugLogger("Opening edit widget modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <WidgetCreationModal key="widgetCreation_modal" editElementDataId={selectedElementData?.id} />,
    ]);
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
      {selectedElementData?.dataType.tag === "WidgetElement" && (
        <StyledMenuItem onClick={handleEditWidget}>Edit</StyledMenuItem>
      )}

      <StyledMenuItem onClick={() => setShowExamine((showExamine) => !showExamine)}>Show details</StyledMenuItem>

      {showExamine && (
        <Paper sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          Created by: {props.contextMenu ? props.contextMenu.elementData.createdBy : ""}
        </Paper>
      )}

      {selectedElementData && (
        <StyledDeleteMenuItem
          onClick={() => {
            handleDeleteElementData(selectedElementData, handleClose);
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
