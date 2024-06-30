import { Menu, MenuItem, Paper } from "@mui/material";
import Guests from "../../../module_bindings/guests";
import { useContext } from "react";
import { IdentityContext } from "../../../Contexts/IdentityContext";
import PermissionLevel from "../../../module_bindings/permission_level";
import Permissions from "../../../module_bindings/permissions";
import styled from "styled-components";
import SetIdentityPermissionModeratorReducer from "../../../module_bindings/set_identity_permission_moderator_reducer";
import ClearIdentityPermissionReducer from "../../../module_bindings/clear_identity_permission_reducer";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const GuestListContextMenu = (props: IProps) => {
  const identity = useContext(IdentityContext);
  const identityPermission = Permissions.findByIdentity(identity.identity)?.permissionLevel;

  const selectedGuest: Guests | null = props.contextMenu ? props.contextMenu.guest : null;
  let selectedGuestPermission: PermissionLevel | undefined;
  if (selectedGuest !== null)
    selectedGuestPermission = Permissions.findByIdentity(selectedGuest.identity)?.permissionLevel;

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
      sx={{ zIndex: 2000000 }}
    >
      {selectedGuest !== null ? (
        <div>
          <Paper variant="outlined" sx={{ fontWeight: "bold", color: "#ffffffa6", padding: "5px", margin: "5px" }}>
            {selectedGuest.nickname}
          </Paper>

          <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
            {"Permission: "}
            {selectedGuestPermission?.tag === undefined ? "User" : selectedGuestPermission?.tag}
          </Paper>

          {!selectedGuest.identity.isEqual(identity.identity) && identityPermission?.tag === "Owner" ? (
            selectedGuestPermission?.tag === "Moderator" ? (
              <StyledMenuItem
                onClick={() => {
                  ClearIdentityPermissionReducer.call(selectedGuest.identity);
                  handleClose();
                }}
              >
                Revoke Moderator
              </StyledMenuItem>
            ) : (
              <StyledMenuItem
                onClick={() => {
                  SetIdentityPermissionModeratorReducer.call(selectedGuest.identity);
                  handleClose();
                }}
              >
                Grant Moderator
              </StyledMenuItem>
            )
          ) : (
            <></>
          )}
        </div>
      ) : (
        ""
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
