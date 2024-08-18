import { useContext, useEffect, useRef, useState } from "react";
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
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ModalContext } from "../../Contexts/ModalContext";

interface IProps {
  dragnAndDropFile?: any;
}

export const ImageUploadModal = (props: IProps) => {
  const { Identity } = useSpacetimeContext();

  const { modals, setModals, closeModal } = useContext(ModalContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [imageName, setImageName] = useState<string>("");
  const [isUrl, setIsUrl] = useState<boolean>(false);
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const [fieldsInitialized, setFieldsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!props.dragnAndDropFile) return setFieldsInitialized(true);

    handleFileChange(props.dragnAndDropFile);
    handleNameChange(props.dragnAndDropFile.name.substr(0, props.dragnAndDropFile.name.lastIndexOf(".")));

    setFieldsInitialized(true);
  }, [props.dragnAndDropFile]);

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
      file.type === "image/png" ||
      file.type === "image/jpg" ||
      file.type === "image/jpeg" ||
      file.type === "image/webp" ||
      file.type === "image/gif";

    if (!isImage) {
      setError("Incorrect file format. File must be an image. (png, jpg, jpeg, webp, or gif)");
      setFile(null);
      return;
    }

    if (file.size / 1024 > 3000)
      setError("Large files can increase load time. Consider compressing the image or uploading with an URL instead.");

    setFile(file);
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
      CreatedBy: Identity.nickname,
    };

    const imageSkeleton = document.getElementById("imageSkeleton");
    imageSkeleton!.style.display = "block";

    insertElementData(newElementData);
    handleOnClose();
  };

  if (isOverlay) return <></>;

  return (
    <>
      {fieldsInitialized && (
        <Dialog open={true} onClose={handleOnClose}>
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Upload image</DialogTitle>
          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            <FormGroup>
              <StyledInput
                focused={true}
                label="Name"
                color="#ffffffa6"
                onChange={(text: any) => handleNameChange(text)}
                defaultValue={imageName}
              />
              <Typography variant="subtitle1" color="#ffffffa6" sx={{ paddingTop: "15px" }}>
                {props.dragnAndDropFile ? "Selected file" : "Select a file"}
                <Tooltip title="Please be aware, all images uploaded to Pogly are publicly accessible. This is a limitation of SpacetimeDB, until they add Row-Level Security.">
                  <WarningIcon
                    sx={{
                      color: "#eed202",
                      position: "fixed",
                      paddingLeft: "5px",
                      fontSize: "20px",
                      paddingTop: "5px",
                    }}
                  />
                </Tooltip>
              </Typography>
              {!props.dragnAndDropFile ? (
                <>
                  <ButtonGroup
                    variant="outlined"
                    aria-label="Basic button group"
                    sx={{ borderColor: "red !important" }}
                  >
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
                    <Input
                      id="file_input"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      onChange={(event: any) => handleFileChange(event.target.files[0])}
                    />
                  )}
                </>
              ) : (
                <StyledFileInputName
                  type="text"
                  name="variableValue"
                  value={props.dragnAndDropFile.name}
                  disabled={true}
                />
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
      )}
    </>
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

const StyledFileInputName = styled.input`
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  background-color: #0a2a47;
  color: #b0bec5;
  border: 1px solid #ffffffa6;
  border-width: 2px;
  border-radius: 5px;
`;
