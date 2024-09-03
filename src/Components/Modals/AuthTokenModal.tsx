import { useContext, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import { StyledButton } from "../StyledComponents/StyledButton";
import { ModalContext } from "../../Contexts/ModalContext";
import { DebugLogger } from "../../Utility/DebugLogger";

export const AuthTokenModal = () => {
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const [token, setToken] = useState<string>("");

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const handleSetToken = () => {
    DebugLogger("Setting auth token");
    localStorage.setItem("stdbToken", token);
    closeModal("authToken_modal", modals, setModals);
  };

  const handleOnClose = () => {
    DebugLogger("Handling close auth token modal close");
    setToken("");
    closeModal("authToken_modal", modals, setModals);
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        Update Auth Token
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <br />
        <StyledInput focused={true} label="Auth Token" color="#ffffffa6" onChange={setToken} defaultValue={""} />
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", textAlign: "center", display: "block" }}>
        <StyledButton
          disabled={token === ""}
          label="Update"
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleSetToken}
        />
      </DialogActions>
    </Dialog>
  );
};
