import { useContext, useState } from "react";
import { Dialog, DialogContent, DialogTitle, FormGroup, Button, DialogActions, Alert } from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import { ModalContext } from "../../Contexts/ModalContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { SpacetimeContextType } from "../../Types/General/SpacetimeContextType";

interface IProps {
  layoutId?: number;
}

export const LayoutCreationModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const spacetimeDB: SpacetimeContextType = useContext(SpacetimeContext);

  const [layoutName, setLayoutName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleNameChange = (text: any) => {
    DebugLogger("Handling layout name change");
    if (!/^[a-z0-9]+$/i.test(text) && text !== "") {
      DebugLogger("Layout name contains unsupported characters");
      setLayoutName("");
      return setError("Layout name can only contain letters and numbers.");
    }
    if (text.length > 20) {
      DebugLogger("Layout name too long");
      setLayoutName("");
      return setError("Layout name can be only 20 characters long.");
    }

    setError("");
    setLayoutName(text);
  };

  const saveLayout = () => {
    DebugLogger("Saving layout");
    spacetimeDB.Client.reducers.addLayout(layoutName, false);
    handleOnClose();
  };

  const updateLayout = () => {
    DebugLogger("Updating layout");
    spacetimeDB.Client.reducers.updateLayoutName(props.layoutId!, layoutName);
    handleOnClose();
  };

  const handleOnClose = () => {
    DebugLogger("Closing layout creation modal");
    closeModal("layoutCreation_modal", modals, setModals);
  };

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>
        {props.layoutId ? "Rename layout" : "Create new layout"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
        <FormGroup sx={{ gap: "20px" }}>
          <StyledInput
            focused={true}
            label="Layout name"
            color="#ffffffa6"
            onChange={(text: any) => {
              handleNameChange(text);
            }}
          />
        </FormGroup>

        {error !== "" && (
          <Alert
            variant="filled"
            severity="warning"
            sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px", width: "230px" }}
          >
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px" }}>
        <Button
          variant="outlined"
          sx={{
            color: "#ffffffa6",
            borderColor: "#ffffffa6",
            "&:hover": { borderColor: "white" },
          }}
          onClick={handleOnClose}
        >
          Cancel
        </Button>
        <Button
          disabled={layoutName === "" ? true : false}
          variant="outlined"
          sx={{
            color: "#ffffffa6",
            borderColor: "#ffffffa6",
            "&:hover": { borderColor: "white" },
            "&:disabled": {
              borderColor: "gray",
              color: "gray",
            },
          }}
          onClick={() => {
            if (props.layoutId) {
              updateLayout();
            } else {
              saveLayout();
            }
          }}
        >
          {props.layoutId ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
