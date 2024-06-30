import { useContext, useState } from "react";
import { insertElementData } from "../../StDB/Reducers/Insert/insertElementData";
import { ElementDataType } from "../../Types/General/ElementDataType";
import DataType from "../../module_bindings/data_type";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  Tooltip,
  Typography,
  Button,
  DialogActions,
  Alert,
  ButtonGroup,
} from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import styled from "styled-components";
import WarningIcon from "@mui/icons-material/Warning";
import { IdentityContext } from "../../Contexts/IdentityContext";
import { ModalContext } from "../../Contexts/ModalContext";

export const ImageUploadModal = () => {
  const identityContext = useContext(IdentityContext);
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [imageName, setImageName] = useState<string>("");
  const [isUrl, setIsUrl] = useState<boolean>(false);
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleNameChange = (name: any) => {
    if (name.length < 2) {
      setError("File name has to be between 2-10 characters long.");
      setImageName("");
      return;
    } else {
      setError("");
    }

    setImageName(name);
  };

  const handleFileChange = (file: any) => {
    setError("");

    const isImage =
      file.target.files[0].type === "image/png" ||
      file.target.files[0].type === "image/jpg" ||
      file.target.files[0].type === "image/jpeg" ||
      file.target.files[0].type === "image/webp" || 
      file.target.files[0].type === "image/gif";

    if (!isImage) {
      setError("Incorrect file format. File must be an image. (png, jpg, jpeg, webp, or gif)");
      setFile(null);
      return;
    }

    if (file.target.files[0].size / 1024 > 3000)
      setError("Large files can increase load time. Consider compressing the image or uploading with an URL instead.");

    setFile(file.target.files[0]);
  };

  const handleURLChange = async (url: any) => {
    setError("");

    if (url.length === 0) {
      return setError("URL cannot be blank.");
    }

    setFile(url);
  };

  const handleOnClose = () => {
    closeModal("imageUpload_modal", modals, setModals);
  };

  const handleSave = () => {
    const newElementData: ElementDataType = {
      Name: imageName,
      DataType: DataType.ImageElement as DataType,
      Data: file,
      DataFileSize: file.size / 1024, //convert to KB's
      CreatedBy: identityContext.nickname,
    };

    insertElementData(newElementData);
    handleOnClose();
  };

  if (isOverlay) return(<></>);

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Upload image</DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
        <FormGroup>
          <StyledInput
            focused={true}
            label="Name"
            color="#ffffffa6"
            onChange={(text: any) => handleNameChange(text)}
            defaultValue={""}
          />
          <Typography variant="subtitle1" color="#ffffffa6" sx={{ paddingTop: "15px" }}>
            Select a file
            <Tooltip title="Please be aware, all images uploaded to Pogly are publicly accessible. This is a limitation of SpacetimeDB, until they add Row-Level Security.">
              <WarningIcon
                sx={{ color: "#eed202", position: "fixed", paddingLeft: "5px", fontSize: "20px", paddingTop: "5px" }}
              />
            </Tooltip>
          </Typography>
          <ButtonGroup variant="outlined" aria-label="Basic button group" sx={{ borderColor: "red !important" }}>
            <Button
              sx={{ borderColor: "#ffffffa6", borderBottom: "none", borderRadius: "0px", color: "#ffffffa6" }}
              onClick={() => setIsUrl(false)}
            >
              File
            </Button>
            <Button
              sx={{ borderColor: "#ffffffa6", borderBottom: "none", borderRadius: "0px", color: "#ffffffa6" }}
              onClick={() => setIsUrl(true)}
            >
              URL
            </Button>
          </ButtonGroup>

          {isUrl ? (
            <Input
              type="text"
              onChange={(event: any) => handleURLChange(event.target.value)}
              style={{
                backgroundColor: "#0a2a47",
              }}
              placeholder="URL to image"
            />
          ) : (
            <Input type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={(event: any) => handleFileChange(event)} />
          )}

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
          disabled={imageName === "" || file === null ? true : false}
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
          onClick={handleSave}
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
