import { useContext, useEffect, useState } from "react";
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { StyledButton } from "../StyledComponents/StyledButton";
import { ModalContext } from "../../Contexts/ModalContext";
import { styled } from "styled-components";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { Permissions } from "../../module_bindings";

export const ModeratorListModal = () => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const { Client } = useSpacetimeContext();
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [moderators, setModerators] = useState<Permissions[]>([]);

  useEffect(() => {
    const permissions: Permissions[] = Array.from(Client.db.permissions.iter());
    const filterModerators = permissions.filter((obj: Permissions) => obj.permissionLevel.tag === "Moderator");

    setModerators(() => filterModerators);
  }, [Client]);

  const handleDeletePermission = (identity: Identity) => {
    Client.reducers.clearIdentityPermission(identity);

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
              {moderators.map((mod: Permissions) => {
                return (
                  <Container key={"mod_" + mod.identity.toHexString().substring(0, 5)}>
                    <StyledDeleteIcon onClick={() => handleDeletePermission(mod.identity)} />
                    <IdentitySpan>{mod.nickname === "" ? mod.nickname : "Unknown..."}</IdentitySpan>
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
