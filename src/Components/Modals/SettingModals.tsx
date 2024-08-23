import { useContext, useEffect, useState } from "react";
import { DownloadElementData } from "../../Utility/DownloadElementData";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PasswordIcon from "@mui/icons-material/Password";
import Fingerprint from "@mui/icons-material/Fingerprint";
import { BackupModal } from "./BackupModal";
import { AuthTokenModal } from "./AuthTokenModal";
import { SettingsContext } from "../../Contexts/SettingsContext";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { ModalContext } from "../../Contexts/ModalContext";
import UpdateGuestNicknameReducer from "../../module_bindings/update_guest_nickname_reducer";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import Permissions from "../../module_bindings/permissions";
import { InstancePasswordModal } from "./InstancePasswordModal";
import Config from "../../module_bindings/config";
import { SettingsTabPanel } from "../Settings/SettingsTabPanel";

interface IProp {
  setDebug: Function;
  onlineVersion: string;
}

export const SettingsModal = (props: IProp) => {
  const config: Config = useContext(ConfigContext);
  const { Identity } = useSpacetimeContext();
  const permission = Permissions.findByIdentity(Identity.identity)?.permissionLevel;

  const { settings, setSettings } = useContext(SettingsContext);
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const [nicknameInput, setNicknameInput] = useState<string>(localStorage.getItem("nickname")!);
  const [tenorAPIKey, setTenorAPIKey] = useState<string>(localStorage.getItem("TenorAPIKey")!);
  const [debugCheckbox, setDebugCheckbox] = useState<boolean>(settings.debug || false);
  const [cursorNameCheckbox, setCursorNameCheckbox] = useState<boolean>(settings.cursorName || true);
  const [streamPlayerInteractable, setStreamPlayerInteractable] = useState<boolean>(false);

  const [tabValue, setTabValue] = useState<number>(0);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const saveSettings = () => {
    localStorage.setItem("nickname", nicknameInput);
    localStorage.setItem("TenorAPIKey", tenorAPIKey);
    UpdateGuestNicknameReducer.call(nicknameInput);

    let newSettings = settings;

    newSettings.debug = debugCheckbox;
    newSettings.cursorName = cursorNameCheckbox;
    localStorage.setItem("settings", JSON.stringify(newSettings));
    setSettings(newSettings);

    props.setDebug(debugCheckbox);
    closeModal("settings_modal", modals, setModals);
  };

  useEffect(() => {
    setSettings(settings);

    const streamInteractable = document.getElementById("stream")?.style.pointerEvents;

    setStreamPlayerInteractable(streamInteractable === "none" ? false : true);
  }, [settings, setSettings]);

  function clearConnectionSettings() {
    localStorage.removeItem("stdbConnectDomain");
    localStorage.removeItem("stdbConnectModule");
    localStorage.removeItem("stdbConnectModuleAuthKey");
    closeModal("settings_modal", modals, setModals);
  }

  const showAuthToken = () => {
    setModals((oldModals: any) => [...oldModals, <AuthTokenModal key="authToken_modal" />]);
  };

  const showInstancePassword = () => {
    setModals((oldModals: any) => [...oldModals, <InstancePasswordModal key="instancePassword_modal" />]);
  };

  const showUploadModal = () => {
    setModals((oldModals: any) => [...oldModals, <BackupModal key="backup_modal" download={false} />]);
  };

  const showDownloadModal = () => {
    setModals((oldModals: any) => [...oldModals, <BackupModal key="backup_modal" download={true} />]);
  };

  const handleStreamPlayerInteractable = () => {
    const stream = document.getElementById("stream")!;

    if (stream.style.pointerEvents === "none") {
      setStreamPlayerInteractable(true);
      stream.style.pointerEvents = "auto";
    } else {
      setStreamPlayerInteractable(false);
      stream.style.pointerEvents = "none";
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noreferrer");
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={true} id="settingsModal" onClose={() => closeModal("settings_modal", modals, setModals)}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Settings</DialogTitle>
      <DialogContent
        sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important", minHeight: "324px" }}
      >
        <Box sx={{ width: "100%", typography: "body1" }}>
          <Tabs value={tabValue} onChange={(event, value) => setTabValue(value)} aria-label="settings tabs">
            <Tab label="General" />
            <Tab label="Advanced" />
            <Tab label="Debug" />
          </Tabs>
          <SettingsTabPanel value={tabValue} index={0}>
            <StyledInput
              focused={false}
              label="Nickname"
              color="#ffffffa6"
              onChange={setNicknameInput}
              defaultValue={localStorage.getItem("nickname")!}
              style={{ width: "100%" }}
            />

            <div style={{ display: "grid", marginTop: "20px" }}>
              <StyledInput
                focused={false}
                label="Tenor v2 API Key"
                color="#ffffffa6"
                onChange={setTenorAPIKey}
                defaultValue={localStorage.getItem("TenorAPIKey")!}
                password={true}
              />

              <Typography
                variant="subtitle2"
                color="#ffffffa6"
                onClick={() => openInNewTab("https://developers.google.com/tenor/guides/quickstart#setup")}
                sx={{
                  "&:hover": {
                    cursor: "pointer",
                  },
                  width: "75px",
                  paddingTop: "5px",
                }}
              >
                Get API key
              </Typography>
              <div style={{ display: "grid", marginTop: "10px" }}>
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6" },
                  }}
                  control={
                    <Checkbox
                      onChange={() => setCursorNameCheckbox(!cursorNameCheckbox)}
                      checked={cursorNameCheckbox}
                      sx={{ color: "#ffffffa6", paddingTop: "0px" }}
                    />
                  }
                  label="Show cursor usernames"
                />

                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6" },
                  }}
                  control={
                    <Checkbox
                      onChange={() => handleStreamPlayerInteractable()}
                      checked={streamPlayerInteractable}
                      sx={{ color: "#ffffffa6", paddingTop: "0px" }}
                    />
                  }
                  label="Stream player interactable"
                />
              </div>

              {props.onlineVersion !== `${process.env.REACT_APP_VERSION}` && (
                <Alert
                  variant="filled"
                  severity="warning"
                  sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px", maxWidth: "280px" }}
                >
                  You have an outdated Pogly version!{" "}
                  <a href="https://github.com/PoglyApp/pogly-standalone/releases">Grab the new version here</a>.
                </Alert>
              )}
            </div>
          </SettingsTabPanel>
          <SettingsTabPanel value={tabValue} index={1}>
            <div style={{ display: "flex" }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  marginTop: "10px",
                  marginRight: "10px",
                }}
                onClick={showUploadModal}
              >
                Import Data
              </Button>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  marginTop: "10px",
                }}
                onClick={showDownloadModal}
              >
                Export Data
              </Button>
            </div>

            <div style={{ display: "grid" }}>
              <Button
                variant="outlined"
                startIcon={<Fingerprint />}
                sx={{
                  color: "#ffa700",
                  borderColor: "#ffa700",
                  "&:hover": { borderColor: "#db8f00" },
                  marginTop: "10px",
                }}
                onClick={showAuthToken}
              >
                Update Auth Token
              </Button>

              {permission && permission.tag === "Owner" && config.authentication && (
                <Button
                  variant="outlined"
                  startIcon={<PasswordIcon />}
                  sx={{
                    color: "#ffa700",
                    borderColor: "#ffa700",
                    "&:hover": { borderColor: "#db8f00" },
                    marginTop: "10px",
                  }}
                  onClick={showInstancePassword}
                >
                  Update Instance Password
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  color: "#ff5238",
                  borderColor: "#ff5238",
                  "&:hover": { borderColor: "#b23927" },
                  marginTop: "10px",
                }}
                onClick={clearConnectionSettings}
              >
                Clear Connection Settings
              </Button>
            </div>
          </SettingsTabPanel>
          <SettingsTabPanel value={tabValue} index={2}>
            <FormControlLabel
              componentsProps={{
                typography: { color: "#ffffffa6" },
              }}
              control={
                <Checkbox
                  onChange={() => setDebugCheckbox(!debugCheckbox)}
                  checked={debugCheckbox}
                  sx={{ color: "#ffffffa6", paddingTop: "15px" }}
                />
              }
              label="Debug mode"
            />
          </SettingsTabPanel>
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px" }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{
            color: "#ffffffa6",
            borderColor: "#ffffffa6",
            "&:hover": { borderColor: "white" },
          }}
          onClick={() => closeModal("settings_modal", modals, setModals)}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          sx={{
            color: "#ffffffa6",
            borderColor: "#ffffffa6",
            "&:hover": { borderColor: "white" },
          }}
          onClick={saveSettings}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
