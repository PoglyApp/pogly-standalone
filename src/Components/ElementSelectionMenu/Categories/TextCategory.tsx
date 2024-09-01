import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { TextCreationModal } from "../../Modals/TextCreationModal";
import { useContext } from "react";
import { ModalContext } from "../../../Contexts/ModalContext";
import { DebugLogger } from "../../../Utility/DebugLogger";

export const TextCategory = () => {
  const { setModals } = useContext(ModalContext);

  const showTextCreationModal = () => {
    DebugLogger("Opening text creation modal");
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
        justifyContent: "left",
        width: "100%",
      }}
      onClick={showTextCreationModal}
    >
      Add Text
    </Button>
  );
};
