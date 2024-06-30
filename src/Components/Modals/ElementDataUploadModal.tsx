import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { useContext, useState } from "react";
import styled from "styled-components";
import { UploadElementDataFromFile } from "../../Utility/UploadElementData";
import { ModalContext } from "../../Contexts/ModalContext";

export const ElementDataUploadModal = () => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleOnClose = () => {
    setFile(null);
    setError("");
    closeModal("elementDataUpload_modal", modals, setModals);
  };

  const handleFileChange = (file: any) => {
    setError("");

    const isJson = file.target.files[0].type === "application/json";

    if (!isJson) {
      setError("Incorrect file format. File must be a .json file.");
      setFile(null);
      return;
    }

    setFile(file.target.files[0]);
  };

  const handleUpload = () => {
    UploadElementDataFromFile(file);
    closeModal("elementDataUpload_modal", modals, setModals);
  };

  if(isOverlay) return(<></>);

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Upload ElementData from Backup</DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
        <FormGroup>
          <Typography variant="subtitle1" color="#ffffffa6" sx={{ paddingTop: "15px" }}>
            Select a File
            <Tooltip title="This must be a Pogly ElementData backup file of extension type .json">
              <WarningIcon
                sx={{ color: "#eed202", position: "fixed", paddingLeft: "5px", fontSize: "20px", paddingTop: "5px" }}
              />
            </Tooltip>
          </Typography>
          <Input type="file" onChange={(event: any) => handleFileChange(event)} />
          {error !== "" && (
            <Alert
              variant="filled"
              severity="warning"
              sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px", maxWidth: "280px" }}
            >
              {error}
            </Alert>
          )}
        </FormGroup>
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
          disabled={file === null ? true : false}
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
          onClick={handleUpload}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Input = styled.input`
  border-style: solid;
  border-color: #ffffffa6;
  border-width: 2px;
  border-radius: 4px;

  padding: 10px;
  color: #ffffffa6;

  max-width: 250px;
`;
