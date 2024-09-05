import { Menu, MenuItem, Paper } from "@mui/material";
import { useContext, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import SetLayoutActiveReducer from "../../../module_bindings/set_layout_active_reducer";
import { ModalContext } from "../../../Contexts/ModalContext";
import { LayoutDeletionConfirmationModal } from "../../Modals/LayoutDeletionConfirmationModal";
import { DebugLogger } from "../../../Utility/DebugLogger";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const LayoutContextMenu = (props: IProps) => {
  const { setModals } = useContext(ModalContext);

  const [showExamine, setShowExamine] = useState(false);

  const handleSetActive = () => {
    DebugLogger("Changing active layout");
    SetLayoutActiveReducer.call(props.contextMenu.layout.id);
    handleClose();
  };

  const showConfirmationModal = () => {
    if (props.contextMenu.layout.createdBy === "Server") {
      DebugLogger("Attempting to delete default layout");
      return toast.warning("Default layout cannot be deleted.", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "dark",
      });
    }

    DebugLogger("Opening delete layout confirmation modal");

    setModals((oldModals: any) => [
      ...oldModals,
      <LayoutDeletionConfirmationModal key="layoutDeletionConfirmationModal_modal" layout={props.contextMenu.layout} />,
    ]);
  };

  const handleClose = () => {
    DebugLogger("Handling close context menu");
    props.setContextMenu(null);
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
      <StyledMenuItem onClick={handleSetActive}>Set active</StyledMenuItem>

      <StyledMenuItem onClick={() => setShowExamine((showExamine) => !showExamine)}>Show details</StyledMenuItem>

      {showExamine && (
        <Paper sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          Created by: {props.contextMenu ? props.contextMenu.layout.createdBy : ""}
        </Paper>
      )}

      <StyledDeleteMenuItem onClick={showConfirmationModal}>Delete</StyledDeleteMenuItem>
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
