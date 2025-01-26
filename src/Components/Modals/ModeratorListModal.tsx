import { useContext, useEffect, useState } from "react";
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { StyledButton } from "../StyledComponents/StyledButton";
import { ModalContext } from "../../Contexts/ModalContext";
import { styled } from "styled-components";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Permissions from "../../module_bindings/permissions";
import ClearIdentityPermissionReducer from "../../module_bindings/clear_identity_permission_reducer";
import { Identity } from "@clockworklabs/spacetimedb-sdk";

export const ModeratorListModal = () => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [moderators, setModerators] = useState<Permissions[]>([]);

  useEffect(() => {
    const permissions: Permissions[] = Permissions.all();
    const filterModerators = permissions.filter((obj: Permissions) => obj.permissionLevel.tag === "Moderator");

    setModerators(() => filterModerators);
  }, []);

  const handleDeletePermission = (identity: Identity) => {
    ClearIdentityPermissionReducer.call(identity);

    const newList = moderators.filter((mod: Permissions) => mod.identity !== identity);

    setModerators(() => newList);
  };

  const handleOnClose = () => {
    closeModal("moderatorList_modal", modals, setModals);
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        Active moderators
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <>
          {moderators.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
              <IdentitySpan>No active moderators</IdentitySpan>
            </div>
          ) : (
            <>
              <Alert
                variant="filled"
                severity="warning"
                sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px", maxWidth: "400px" }}
              >
                Due to an oversight, unfortunately we cannot link offline moderators to nicknames at this time - will be
                fixed in a future update.
              </Alert>

              {moderators.map((mod: Permissions) => {
                return (
                  <Container key={"mod_" + mod.identity.toHexString().substring(0, 5)}>
                    <StyledDeleteIcon onClick={() => handleDeletePermission(mod.identity)} />
                    <IdentitySpan>{mod.identity.toHexString().substring(0, 40)}...</IdentitySpan>
                  </Container>
                );
              })}
            </>
          )}
        </>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", textAlign: "center", display: "block" }}>
        <StyledButton
          disabled={false}
          label="Close"
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleOnClose}
        />
      </DialogActions>
    </Dialog>
  );
};

const Container = styled.div`
  display: flex;
  background-color: #032e57;

  padding: 10px;

  margin-bottom: 10px;
  margin-top: 20px;
`;

const StyledDeleteIcon = styled(DeleteOutlineIcon)`
  color: #d82b2b;
  align-self: center;
  padding-right: 5px;

  &:hover {
    color: #960000;
    cursor: pointer;
  }
`;

const IdentitySpan = styled.span`
  color: #ffffffa6;
  align-self: center;
`;
