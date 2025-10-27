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
import { DebugLogger } from "../../Utility/DebugLogger";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { Config } from "../../module_bindings";

interface IProps {
  download: boolean;
}

export const BackupModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const { spacetimeDB } = useContext(SpacetimeContext);
  const config: Config = spacetimeDB.Client.db.config.version.find(0);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [downData, setDownData] = useState<boolean>(true);
  const [downElement, setDownElement] = useState<boolean>(false);
  const [downLayout, setDownLayout] = useState<boolean>(false);
  const [deleteOnUpload, setDeleteOnUpload] = useState<boolean>(false);

  useEffect(() => {
    if (!props.download) return;

    if (downElement) setDownData(true);
  }, [downData, downElement, downLayout, props.download]);

  const handleOnClose = () => {
    setFile(null);
    setError("");
    closeModal("backup_modal", modals, setModals);
  };

  const handleFileChange = (file: any) => {
    setError("");

    const isSqlite = file.target.files[0].name.endsWith(".sqlite");

    if (!isSqlite) {
      setError("Incorrect file format. File must be a sqlite file.");
      setFile(null);
      return;
    }

    setFile(file.target.files[0]);
  };

  const handleUpload = async () => {
    await UploadBackupFromFile(spacetimeDB.Client, file, deleteOnUpload, true);
    closeModal("backup_modal", modals, setModals);
  };

  const handleDownload = () => {
    DebugLogger("Handling download data");
    DownloadElementData(spacetimeDB.Client, downData, downElement, downLayout, config, modals, setModals, closeModal);
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
