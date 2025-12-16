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
  const [claimButtonText, setClaimButtonText] = useState<string>("Claim");
  const [verificationFailed, setVerificationFailed] = useState<boolean>(false);

  const attemptVerify = () => {
    if (!verifyKey || verifyKey === "") return console.error("Verify key is blank.");

    const key = verifyKey;
    setVerifyKey("");

    setClaimButtonText("Claiming...");
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
        Claim module ownership
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
          Input below the one time use ownership claim key provided to you by Pogly developers or if self-hosted, your
          Pogly instance maintainer.
        </p>

        <StyledInput
          focused={false}
          label="Ownership claim key"
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
            Failed to claim ownership. Please make sure the claim key is correct.
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
