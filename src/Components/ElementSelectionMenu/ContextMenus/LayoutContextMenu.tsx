import { Menu, MenuItem, Paper } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import DeleteLayoutReducer from "../../../module_bindings/delete_layout_reducer";
import { toast } from "react-toastify";
import SetLayoutActiveReducer from "../../../module_bindings/set_layout_active_reducer";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const LayoutContextMenu = (props: IProps) => {
  const [showExamine, setShowExamine] = useState(false);

  const handleSetActive = () => {
    SetLayoutActiveReducer.call(props.contextMenu.layout.id);
    handleClose();
  };

  const handleDeleteLayout = () => {
    if (props.contextMenu.layout.createdBy === "Server") {
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

    DeleteLayoutReducer.call(props.contextMenu.layout.id, false);
    handleClose();
  };

  const handleClose = () => {
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

      <StyledDeleteMenuItem onClick={handleDeleteLayout}>Delete</StyledDeleteMenuItem>
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
