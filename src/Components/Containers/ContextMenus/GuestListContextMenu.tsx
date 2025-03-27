import { Menu, MenuItem, Paper } from "@mui/material";
import { useSpacetimeContext } from "../../../Contexts/SpacetimeContext";
import styled from "styled-components";
import { DebugLogger } from "../../../Utility/DebugLogger";
import { Guests, PermissionLevel } from "../../../module_bindings";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const GuestListContextMenu = (props: IProps) => {
  const { Identity, Client } = useSpacetimeContext();
  const identityPermission = Client.db.permissions.identity.find(Identity.identity)?.permissionLevel;

  const selectedGuest: Guests | null = props.contextMenu ? props.contextMenu.guest : null;
  let selectedGuestPermission: PermissionLevel | undefined;
  if (selectedGuest !== null && selectedGuest.identity)
    selectedGuestPermission = Client.db.permissions.identity.find(selectedGuest.identity)?.permissionLevel;

  const handleClose = () => {
    DebugLogger("Handling close context");
    props.setContextMenu(null);
  };

  if (!selectedGuest) return <></>;

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
      <div>
        <Paper variant="outlined" sx={{ fontWeight: "bold", color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          {selectedGuest.nickname}
        </Paper>

        <Paper variant="outlined" sx={{ color: "#ffffffa6", padding: "5px", margin: "5px" }}>
          {"Permission: "}
          {selectedGuestPermission?.tag === undefined ? "User" : selectedGuestPermission?.tag}
        </Paper>

        {!selectedGuest.identity.isEqual(Identity.identity) &&
        identityPermission &&
        identityPermission.tag === "Owner" ? (
          <>
            {selectedGuestPermission?.tag === "Moderator" ? (
              <StyledMenuItemOrange
                onClick={() => {
                  Client.reducers.clearIdentityPermission(selectedGuest.identity);
                  handleClose();
                }}
                sx={{ color: "#008205" }}
              >
                Revoke Moderator
              </StyledMenuItemOrange>
            ) : (
              <StyledMenuItemGreen
                onClick={() => {
                  Client.reducers.setIdentityPermissionModerator(selectedGuest.identity, selectedGuest.nickname);
                  handleClose();
                }}
              >
                Grant Moderator
              </StyledMenuItemGreen>
            )}
            <StyledMenuItemRed
              onClick={() => {
                Client.reducers.kickGuest(selectedGuest.address);
                handleClose();
              }}
            >
              Kick Guest
            </StyledMenuItemRed>
          </>
        ) : (
          <></>
        )}

        {selectedGuest.identity.isEqual(Identity.identity) ? (
          <>
            <StyledMenuItemRed
              onClick={() => {
                Client.reducers.kickSelf();
                handleClose();
              }}
            >
              Kick Self
            </StyledMenuItemRed>
          </>
        ) : (
          <></>
        )}
      </div>
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
