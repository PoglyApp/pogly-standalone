import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { UploadBackupFromFile } from "../../Utility/UploadElementData";
import { ModalContext } from "../../Contexts/ModalContext";
import { DownloadElementData } from "../../Utility/DownloadElementData";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import DeleteAllElementDataReducer from "../../module_bindings/delete_all_element_data_reducer";
import DeleteAllElementsReducer from "../../module_bindings/delete_all_elements_reducer";
import DeleteAllLayoutsReducer from "../../module_bindings/delete_all_layouts_reducer";
import DeleteAllFoldersReducer from "../../module_bindings/delete_all_folders_reducer";

interface IProps {
  download: boolean;
}

export const BackupModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const config = useContext(ConfigContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [downData, setDownData] = useState<boolean>(true);
  const [downElement, setDownElement] = useState<boolean>(false);
  const [downLayout, setDownLayout] = useState<boolean>(false);
  const [deleteOnUpload,setDeleteOnUpload] = useState<boolean>(false);

  useEffect(() => {
    if (!props.download) return;

    if (downElement) setDownData(true);
    DebugLogger("Setting download data");
  }, [downData, downElement, downLayout, props.download]);

  const handleOnClose = () => {
    DebugLogger("Handling backup modal close");
    setFile(null);
    setError("");
    closeModal("backup_modal", modals, setModals);
  };

  const handleFileChange = (file: any) => {
    DebugLogger("Handling backup modal file change");
    setError("");

    const isJson = file.target.files[0].type === "application/json";

    if (!isJson) {
      DebugLogger("File not JSON");
      setError("Incorrect file format. File must be a .json file.");
      setFile(null);
      return;
    }

    setFile(file.target.files[0]);
  };

  const handleUpload = () => {
    if(!deleteOnUpload) {
      DebugLogger("Uploading backup data");
      UploadBackupFromFile(file);
      closeModal("backup_modal", modals, setModals);
    } else {
      DebugLogger("Uploading backup data - clearing existing data");
      DeleteAllElementsReducer.call();
      DeleteAllElementDataReducer.call();
      DeleteAllLayoutsReducer.call(false);
      DeleteAllFoldersReducer.call(false);
      UploadBackupFromFile(file);
      closeModal("backup_modal", modals, setModals);
    }
  };

  const handleDownload = () => {
    DebugLogger("Handling download data");
    DownloadElementData(downData, downElement, downLayout, config, modals, setModals, closeModal);
  };

  if (isOverlay) return <></>;

  if (!props.download) {
    return (
      <Dialog open={true} onClose={handleOnClose}>
        <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Import Pogly Data</DialogTitle>
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
            <div style={{ display: "grid", marginTop: "10px" }}>
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6", paddingTop: "1px" },
                  }}
                  sx={{ alignItems: "start" }}
                  control={
                    <Checkbox
                      onChange={() => setDeleteOnUpload(!deleteOnUpload)}
                      defaultChecked={deleteOnUpload}
                      sx={{ color: "#ffffffa6", paddingTop: "0px" }}
                    />
                  }
                  label="Clear existing data"
                  title="Recommended for large modules with multiple layouts!"
                />
              </div>
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
  }

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Export Pogly Data</DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
        <FormGroup>
          <Typography variant="subtitle1" color="#ffffffa6" sx={{ paddingTop: "15px" }}>
            Select data you wish to export:
          </Typography>
          <FormControlLabel
            componentsProps={{
              typography: { color: "#ffffffa6" },
            }}
            control={
              <Checkbox
                onChange={() => setDownData(!downData)}
                checked={downData}
                disabled={downElement}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  "&:disabled": {
                    borderColor: "gray",
                    color: "gray",
                  },
                }}
              />
            }
            label="ElementData"
          />
          <FormControlLabel
            componentsProps={{
              typography: { color: "#ffffffa6" },
            }}
            control={
              <Checkbox
                onChange={() => setDownElement(!downElement)}
                checked={downElement}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  "&:disabled": {
                    borderColor: "gray",
                    color: "gray",
                  },
                }}
              />
            }
            label="Elements"
          />
          <FormControlLabel
            componentsProps={{
              typography: { color: "#ffffffa6" },
            }}
            control={
              <Checkbox
                onChange={() => setDownLayout(!downLayout)}
                checked={downLayout}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  "&:disabled": {
                    borderColor: "gray",
                    color: "gray",
                  },
                }}
              />
            }
            label="Layouts"
          />
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
          disabled={!downData && !downElement && !downLayout}
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
          onClick={handleDownload}
        >
          Download
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
