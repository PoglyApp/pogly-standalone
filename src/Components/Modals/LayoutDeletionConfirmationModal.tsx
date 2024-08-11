import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Tooltip,
} from "@mui/material";
import { useContext, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import Layouts from "../../module_bindings/layouts";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteLayoutReducer from "../../module_bindings/delete_layout_reducer";

interface IProp {
  layout: Layouts;
}

export const LayoutDeletionConfirmationModal = (props: IProp) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [preserveElements, setPreserveElements] = useState<boolean>(false);

  if (isOverlay) return <></>;

  const handleDeleteLayout = () => {
    DeleteLayoutReducer.call(props.layout.id, preserveElements);
    handleOnClose();
  };

  const handleOnClose = () => {
    closeModal("layoutDeletionConfirmationModal_modal", modals, setModals);
  };

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        {"Are you sure you want to delete " + props.layout.name + "?"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <DialogContentText sx={{ color: "#ffffffa6", textAlign: "center", paddingBottom: "8px" }}>
          Any elements in this layout will be deleted and cannot be recovered.
        </DialogContentText>

        <FormGroup sx={{ alignItems: "center", color: "#ffffffa6" }}>
          <FormControlLabel
            control={
              <Tooltip title="Preserved elements will be transferred to Default layout.">
                <Checkbox
                  sx={{ color: "#ffffffa6" }}
                  checked={preserveElements}
                  onChange={() => setPreserveElements(!preserveElements)}
                />
              </Tooltip>
            }
            label="Perserve elements?"
          />
        </FormGroup>

        <center>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            sx={{
              color: "#ff5238",
              borderColor: "#ff5238",
              "&:hover": { borderColor: "#b23927" },
              marginTop: "10px",
              marginBottom: "20px",
            }}
            onClick={handleDeleteLayout}
          >
            {"Delete " + props.layout.name}
          </Button>
        </center>
      </DialogContent>
    </Dialog>
  );
};
