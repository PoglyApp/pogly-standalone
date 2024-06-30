import { useContext, useState } from "react"
import { ModalContext } from "../../Contexts/ModalContext"
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import { StyledButton } from "../StyledComponents/StyledButton";
import UpdateAuthenticationKeyReducer from "../../module_bindings/update_authentication_key_reducer";

export const InstancePasswordModal = () => {
    const { modals, setModals, closeModal } = useContext(ModalContext);
    const isOverlay: Boolean = window.location.href.includes("/overlay");

    const [password, setPassword] = useState<string>("");
    const [compare, setCompare] = useState<string>("");

    const handleSetPassword = () => {
        UpdateAuthenticationKeyReducer.call(password);
        closeModal("instancePassword_modal", modals, setModals);
    };

    const handleOnClose = () => {
        setPassword("");
        closeModal("instancePassword_modal", modals, setModals);
    }

    if (isOverlay) return(<></>);

    return (
        <Dialog open={true} onClose={handleOnClose}>
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
            Update Authentication Key
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
            <br />
            <StyledInput focused={true} label="Authentication Key" color="#ffffffa6" onChange={setPassword} password={true} defaultValue={""} />
            <br /><br />
            <StyledInput focused={false} label="Confirm Key" color="#ffffffa6" onChange={setCompare} password={true} defaultValue={""} />
            {password !== compare && password !== "" && compare !== "" && <Alert
                variant="filled"
                severity="warning"
                sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px" }}
              >
                Key's don't match!
              </Alert>}
          </DialogContent>
          <DialogActions sx={{ backgroundColor: "#0a2a47", textAlign: "center", display: "block" }}>
            <StyledButton
              disabled={password === "" || password !== compare}
              label="Update"
              textColor="black"
              backgroundColor="#ffffffa6"
              hoverColor="white"
              onClick={handleSetPassword}
            />
          </DialogActions>
        </Dialog>
      );
}