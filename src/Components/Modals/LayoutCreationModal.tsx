import { useContext, useState } from "react";
import { Dialog, DialogContent, DialogTitle, FormGroup, Button, DialogActions, Alert } from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import { ModalContext } from "../../Contexts/ModalContext";
import AddLayoutReducer from "../../module_bindings/add_layout_reducer";

export const LayoutCreationModal = () => {
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const [layoutName, setLayoutName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleNameChange = (text: any) => {
    if (!/^[a-z0-9]+$/i.test(text) && text !== "") {
      setLayoutName("");
      return setError("Layout name can only contain letters and numbers.");
    }
    if (text.length > 20) {
      setLayoutName("");
      return setError("Layout name can be only 20 characters long.");
    }

    setError("");
    setLayoutName(text);
  };

  const saveLayout = () => {
    AddLayoutReducer.call(layoutName, false);
    handleOnClose();
  };

  const handleOnClose = () => {
    closeModal("layoutCreation_modal", modals, setModals);
  };

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Create new layout</DialogTitle>
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
          onClick={saveLayout}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
