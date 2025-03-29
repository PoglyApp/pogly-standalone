import { Menu, MenuItem, Paper, Tooltip } from "@mui/material";
import { useContext, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { ModalContext } from "../../../Contexts/ModalContext";
import { LayoutDeletionConfirmationModal } from "../../Modals/LayoutDeletionConfirmationModal";
import { DebugLogger } from "../../../Utility/DebugLogger";
import { SpacetimeContext } from "../../../Contexts/SpacetimeContext";
import InfoOutlineIcon from "@mui/icons-material/InfoOutlined";
import { LayoutCreationModal } from "../../Modals/LayoutCreationModal";
import { PermissionLevel } from "../../../module_bindings";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const LayoutContextMenu = (props: IProps) => {
  const { setModals } = useContext(ModalContext);
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [showExamine, setShowExamine] = useState(false);

  const strictMode: boolean = spacetimeDB.Client.db.config.version.find(0)!.strictMode;
  const permissions: PermissionLevel | undefined = spacetimeDB.Client.db.permissions.identity.find(spacetimeDB.Identity.identity)?.permissionLevel;

  const handleSetActive = () => {
    DebugLogger("Changing active layout");
    spacetimeDB.Client.reducers.setLayoutActive(props.contextMenu.layout.id);
    handleClose();
  };

  const renameLayout = () => {
    DebugLogger("Opening layout creation modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <LayoutCreationModal key="layoutCreation_modal" layoutId={props.contextMenu.layout.id} />,
    ]);
  };

  const cloneLayout = () => {
    DebugLogger("Cloning layout");
    spacetimeDB.Client.reducers.duplicateLayout(props.contextMenu.layout.id);
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

  if (!props.contextMenu) return <></>;

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

      {props.contextMenu.layout.id !== 1 ? (
        <div>
          {strictMode && !permissions ? (
            <Tooltip title="Strict mode is enabled and preventing you from renaming layouts. Ask the instance owner!">
              <StyledDisabledMenuItem>
                <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingRight: "5px" }} />
                Rename
              </StyledDisabledMenuItem>
            </Tooltip>
          ) : (
            <StyledMenuItem onClick={renameLayout}>Rename</StyledMenuItem>
          )}
        </div>
      ) : (
        <Tooltip title="Default layout cannot be renamed.">
          <StyledDisabledMenuItem>
            <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingRight: "5px" }} />
            Rename
          </StyledDisabledMenuItem>
        </Tooltip>
      )}

      {strictMode && !permissions ? (
        <Tooltip title="Strict mode is enabled and preventing you from cloning layouts. Ask the instance owner!">
          <StyledDisabledMenuItem>
            <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingRight: "5px" }} />
            Clone
          </StyledDisabledMenuItem>
        </Tooltip>
      ) : (
        <StyledMenuItem onClick={cloneLayout}>Clone</StyledMenuItem>
      )}

      <StyledMenuItem onClick={() => setShowExamine((showExamine) => !showExamine)}>Show details</StyledMenuItem>

      {showExamine && (
        <Paper sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          Created by: {props.contextMenu ? props.contextMenu.layout.createdBy : ""}
        </Paper>
      )}

      {props.contextMenu.layout.id !== 1 ? (
        <div>
          {strictMode && !permissions && props.contextMenu.layout.id !== 1 ? (
            <Tooltip title="Strict mode is enabled and preventing you from deleting layouts. Ask the instance owner!">
              <StyledDisabledDeleteMenuItem>
                <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingRight: "5px" }} />
                Delete
              </StyledDisabledDeleteMenuItem>
            </Tooltip>
          ) : (
            <StyledDeleteMenuItem onClick={showConfirmationModal}>Delete</StyledDeleteMenuItem>
          )}
        </div>
      ) : (
        <Tooltip title="Default layout cannot be deleted.">
          <StyledDisabledDeleteMenuItem>
            <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingRight: "5px" }} />
            Delete
          </StyledDisabledDeleteMenuItem>
        </Tooltip>
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
`;

const StyledDisabledMenuItem = styled(MenuItem)`
  color: #ffffff4e;

  margin-left: 5px;
  margin-right: 5px;

  padding-left: 5px;

  cursor: not-allowed;
`;

const StyledDisabledDeleteMenuItem = styled(MenuItem)`
  color: #681c1c;

  margin-left: 5px;
  margin-right: 5px;

  padding-left: 5px;

  cursor: not-allowed;
`;
