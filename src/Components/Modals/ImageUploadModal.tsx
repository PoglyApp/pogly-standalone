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
import { CompressImage } from "../../Utility/CompressImage";
import { SettingsContext } from "../../Contexts/SettingsContext";
import { DebugLogger } from "../../Utility/DebugLogger";

interface IProps {
  dragnAndDropFile?: any;
}

export const ImageUploadModal = (props: IProps) => {
  const { Identity } = useSpacetimeContext();
  const { settings } = useContext(SettingsContext);

  const { modals, setModals, closeModal } = useContext(ModalContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [imageName, setImageName] = useState<string>("");
  const [isUrl, setIsUrl] = useState<boolean>(false);

  const [file, setFile] = useState<any>(null);
  const [isFileGif, setIsFileGif] = useState<boolean>(false);
  const [compressedFile, setCompressedFile] = useState<any>(null);
  const [compressing, setCompressing] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [fieldsInitialized, setFieldsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!props.dragnAndDropFile) return setFieldsInitialized(true);
    DebugLogger("Initializing image upload modal");

    handleFileChange(props.dragnAndDropFile);
    handleNameChange(props.dragnAndDropFile.name.substr(0, props.dragnAndDropFile.name.lastIndexOf(".")));

    setFieldsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dragnAndDropFile]);

  const handleNameChange = (name: any) => {
    DebugLogger("Handling image name change");
    if (name.length < 2) {
      DebugLogger("File name wrong length");
      setError("File name has to be between 2-10 characters long.");
      setImageName("");
      return;
    } else {
      setError("");
    }

    setImageName(name);
  };

  const handleFileChange = async (changedFile: any) => {
    DebugLogger("Handling file change");
    setError("");

    const isImage =
      changedFile.type === "image/png" ||
      changedFile.type === "image/jpg" ||
      changedFile.type === "image/jpeg" ||
      changedFile.type === "image/webp" ||
      changedFile.type === "image/gif";

    if (!isImage) {
      DebugLogger("File not an image");
      setError("Incorrect file format. File must be an image. (png, jpg, jpeg, webp, or gif)");
      setFile(null);
      return;
    }

    const isGif = changedFile.type === "image/gif" || changedFile.type === "image/webp";
    setIsFileGif(isGif);

    if (settings.compressUpload && !isGif) await handleImageCompression(changedFile);

    if (changedFile.size / 1024 > 3000)
      setError("Large files can increase load time. Consider compressing the image or uploading with an URL instead.");

    setFile(changedFile);
  };

  const handleURLChange = async (url: any) => {
    DebugLogger("Handling image URL change");
    setError("");

    if (url.length === 0) {
      return setError("URL cannot be blank.");
    }

    setFile(url);
  };

  const handleOnClose = () => {
    DebugLogger("Handling image upload modal close");
    closeModal("imageUpload_modal", modals, setModals);
  };

  const handleSave = () => {
    DebugLogger("Saving image");
    const usedFile = compressedFile ? compressedFile : file;

    const newElementData: ElementDataType = {
      Name: imageName,
      DataType: DataType.ImageElement as DataType,
      Data: usedFile,
      DataFileSize: usedFile.size / 1024, //convert to KB's
      CreatedBy: Identity.nickname,
    };

    const imageSkeleton = document.getElementById("imageSkeleton");
    if (imageSkeleton) imageSkeleton.style.display = "block";

    insertElementData(newElementData);
    handleOnClose();
  };

  const handleImageCompression = async (file: any) => {
    DebugLogger("Compressing image");
    setCompressing(true);

    const newFile = await CompressImage(file);

    if (!newFile) return setError("Failed to compress file. Check console and send error to @Dynny.");

    setCompressedFile(newFile);
    setCompressing(false);
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

              {file && !isFileGif && (
                <div style={{ display: "flex" }}>
                  <div>
                    <Typography variant="subtitle1" color="#ffffffa6" sx={{ paddingTop: "15px" }}>
                      File compression
                    </Typography>

                    {!settings.compressUpload && (
                      <Typography variant="body1" color="#ffffffa6" sx={{ alignSelf: "center" }}>
                        Image compression disabled in Settings.
                      </Typography>
                    )}

                    {compressedFile && (
                      <div style={{ alignContent: "end" }}>
                        <Typography variant="body1" color="red" sx={{ alignSelf: "center" }}>
                          Before: {Math.floor(file.size / 1024)} KB
                        </Typography>

                        <Typography variant="body1" color="green" sx={{ alignSelf: "center" }}>
                          After: {Math.floor(compressedFile.size / 1024)} KB
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isFileGif && (
                <div>
                  <Typography variant="subtitle1" color="#ffffffa6" sx={{ paddingTop: "15px" }}>
                    File compression
                  </Typography>
                  <Typography variant="body2" color="#ffffffa6">
                    Unavailable for Webp or GIFs.
                  </Typography>
                </div>
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
              disabled={imageName === "" || file === null || compressing ? true : false}
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
