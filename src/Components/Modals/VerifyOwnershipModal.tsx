import { useContext, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { StyledInput } from "../StyledComponents/StyledInput";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";

export const VerifyOwnershipModal = () => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [verifyKey, setVerifyKey] = useState<string>("");
  const [claimButtonText, setClaimButtonText] = useState<string>("Verify");
  const [verificationFailed, setVerificationFailed] = useState<boolean>(false);

  const attemptVerify = () => {
    if (!verifyKey || verifyKey === "") return console.error("Verify key is blank.");

    const key = verifyKey;
    setVerifyKey("");

    setClaimButtonText("Verifying...");
    spacetimeDB.Client.reducers.claimOwnership(verifyKey);

    setTimeout(() => {
      setVerificationFailed(true);
      setClaimButtonText("Verify");
      setVerifyKey(key);
    }, 5000);
  };

  return (
    <Dialog
      open={true}
      id="guidelineModal"
      onClose={() => {
        closeModal("verifyownership_modal", modals, setModals);
      }}
      sx={{
        ".MuiDialog-paper": {},
      }}
    >
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        Verify module ownership
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#0a2a47",
          paddingBottom: "3px",
          paddingTop: "10px !important",
          minWidth: "480px !important",
        }}
      >
        <p style={{ color: "#ffffffa6" }}>
          Pogly has been updated and there has been a significant under the hood change regarding authentication and
          user identity management. Due to this change, the module owner must do a manual verification in order to
          re-claim ownership for their module
        </p>

        <ol style={{ listStyle: "auto", marginLeft: "30px", marginTop: "15px", color: "#ffffffa6" }}>
          <li>
            Run <a style={{ backgroundColor: "#78787957", padding: "3px", borderRadius: "8px" }}>/claim</a> command in{" "}
            <a style={{ color: "#82a5ff" }} href="https://discord.gg/pogly">
              Pogly Discord
            </a>
            .
          </li>
          <li>Pogly Bot will DM you keys for your modules.</li>
          <li>Paste your key to the field below.</li>
          <li>
            Press <a style={{ backgroundColor: "#78787957", padding: "3px", borderRadius: "8px" }}>Verify</a> button.
          </li>
        </ol>

        <StyledInput
          focused={false}
          label="Verification key"
          color="#ffffffa6"
          onChange={setVerifyKey}
          style={{ width: "100%", marginTop: "20px" }}
        />

        {verificationFailed && (
          <Alert
            variant="filled"
            severity="error"
            sx={{ backgroundColor: "#f51313 !important", color: "#212121", marginTop: "20px", maxWidth: "100%" }}
          >
            Failed to verify ownership. Please make sure the verification key is correct.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px" }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{
            color: "#ffffffa6",
            borderColor: "#ffffffa6",
            "&:hover": { borderColor: "white" },
          }}
          onClick={() => closeModal("verifyownership_modal", modals, setModals)}
        >
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<FingerprintIcon />}
          sx={{
            color: "#00ff2aa6",
            borderColor: "#00ff2aa6",
            "&:hover": { borderColor: "#00ff2ad6" },
            "&:disabled": { borderColor: "#00ff2a4c", color: "#00ff2a4c" },
          }}
          onClick={() => attemptVerify()}
          disabled={verifyKey === "" || !verifyKey ? true : false}
        >
          {claimButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
