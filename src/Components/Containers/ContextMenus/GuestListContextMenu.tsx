import { Menu, MenuItem, Paper } from "@mui/material";
import Guests from "../../../module_bindings/guests";
import { useSpacetimeContext } from "../../../Contexts/SpacetimeContext";
import PermissionLevel from "../../../module_bindings/permission_level";
import Permissions from "../../../module_bindings/permissions";
import styled from "styled-components";
import SetIdentityPermissionModeratorReducer from "../../../module_bindings/set_identity_permission_moderator_reducer";
import ClearIdentityPermissionReducer from "../../../module_bindings/clear_identity_permission_reducer";
import KickGuestReducer from "../../../module_bindings/kick_guest_reducer";
import { DebugLogger } from "../../../Utility/DebugLogger";
import KickSelfReducer from "../../../module_bindings/kick_self_reducer";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const GuestListContextMenu = (props: IProps) => {
  const { Identity } = useSpacetimeContext();
  const identityPermission = Permissions.findByIdentity(Identity.identity)?.permissionLevel;

  const selectedGuest: Guests | null = props.contextMenu ? props.contextMenu.guest : null;
  let selectedGuestPermission: PermissionLevel | undefined;
  if (selectedGuest !== null && selectedGuest.identity)
    selectedGuestPermission = Permissions.findByIdentity(selectedGuest.identity)?.permissionLevel;

  const handleClose = () => {
    DebugLogger("Handling close context");
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
      {selectedGuest !== null && identityPermission ? (
        <div>
          <Paper variant="outlined" sx={{ fontWeight: "bold", color: "#ffffffa6", padding: "5px", margin: "5px" }}>
            {selectedGuest.nickname}
          </Paper>

          <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
            {"Permission: "}
            {selectedGuestPermission?.tag === undefined ? "User" : selectedGuestPermission?.tag}
          </Paper>

          {!selectedGuest.identity.isEqual(Identity.identity) && identityPermission.tag === "Owner" ? (
            <>
              {selectedGuestPermission?.tag === "Moderator" ? (
                <StyledMenuItemOrange
                  onClick={() => {
                    ClearIdentityPermissionReducer.call(selectedGuest.identity);
                    handleClose();
                  }}
                  sx={{ color: "#008205" }}
                >
                  Revoke Moderator
                </StyledMenuItemOrange>
              ) : (
                <StyledMenuItemGreen
                  onClick={() => {
                    SetIdentityPermissionModeratorReducer.call(selectedGuest.identity);
                    handleClose();
                  }}
                >
                  Grant Moderator
                </StyledMenuItemGreen>
              )}
              <StyledMenuItemRed
                onClick={() => {
                  KickGuestReducer.call(selectedGuest.address);
                  handleClose();
                }}
              >
                Kick Guest
              </StyledMenuItemRed>
            </>
          ) : (
            <></>
          )}

          {selectedGuest.identity.isEqual(Identity.identity) ? (<>
            <StyledMenuItemRed
                onClick={() => {
                  KickSelfReducer.call();
                  handleClose();
                }}
              >
                Kick Self
              </StyledMenuItemRed>
          </>) : (<></>)}
        </div>
      ) : (
        ""
      )}
    </Menu>
  );
};

const StyledMenuItemGreen = styled(MenuItem)`
  &:hover {
    background-color: #001529;
  }

  color: #008205;

  padding-left: 5px;

  margin-left: 5px;
  margin-right: 5px;
`;

const StyledMenuItemOrange = styled(MenuItem)`
  &:hover {
    background-color: #001529;
  }

  color: #cc5500;

  padding-left: 5px;

  margin-left: 5px;
  margin-right: 5px;
`;

const StyledMenuItemRed = styled(MenuItem)`
  &:hover {
    background-color: #001529;
  }

  color: #800000;

  padding-left: 5px;

  margin-left: 5px;
  margin-right: 5px;
`;
