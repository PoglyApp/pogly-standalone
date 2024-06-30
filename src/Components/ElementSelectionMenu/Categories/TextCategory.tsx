import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { TextCreationModal } from "../../Modals/TextCreationModal";
import { useContext } from "react";
import { ModalContext } from "../../../Contexts/ModalContext";

export const TextCategory = () => {
  const { setModals } = useContext(ModalContext);

  const showTextCreationModal = () => {
    setModals((oldModals: any) => [...oldModals, <TextCreationModal key="textCreation_modal" />]);
  };

  return (
    <Button
      variant="text"
      startIcon={<AddCircleOutlineIcon />}
      sx={{
        color: "#ffffffa6",
        textTransform: "initial",
        paddingLeft: "20px",
        fontSize: "15px",
      }}
      onClick={showTextCreationModal}
    >
      Add Text
    </Button>
  );
};
