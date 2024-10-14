import { useContext, useEffect, useState } from "react";
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
  Radio,
  RadioGroup,
  Tab,
  Tabs,
} from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PasswordIcon from "@mui/icons-material/Password";
import Fingerprint from "@mui/icons-material/Fingerprint";
import ContentPaste from "@mui/icons-material/ContentPaste";
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
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteAllElementsReducer from "../../module_bindings/delete_all_elements_reducer";
import DeleteAllElementDataReducer from "../../module_bindings/delete_all_element_data_reducer";
import RefreshOverlayReducer from "../../module_bindings/refresh_overlay_reducer";
import RefreshOverlayClearStorageReducer from "../../module_bindings/refresh_overlay_clear_storage_reducer";
import UpdateConfigReducer from "../../module_bindings/update_config_reducer";

interface IProp {
  onlineVersion: string;
}

export const SettingsModal = (props: IProp) => {
  const config: Config = useContext(ConfigContext);
  const { Runtime, Identity } = useSpacetimeContext();
  const permission = Permissions.findByIdentity(Identity.identity)?.permissionLevel;

  const { settings, setSettings } = useContext(SettingsContext);
  const { modals, setModals, closeModal } = useContext(ModalContext);

  // GENERAL
  const stream = document.getElementById("stream")!;
  const [nicknameInput, setNicknameInput] = useState<string>(localStorage.getItem("nickname")!);
  const [tenorAPIKey, setTenorAPIKey] = useState<string>(localStorage.getItem("TenorAPIKey")!);
  const [cursorNameCheckbox, setCursorNameCheckbox] = useState<boolean>(true);
  const [streamPlayerInteractable, setStreamPlayerInteractable] = useState<boolean>(
    stream.style.pointerEvents === "none" ? false : true
  );

  // ADVANCED
  const [compressUpload, setCompressUpload] = useState<boolean>(
    settings.compressUpload != null ? settings.compressUpload : true
  );
  const [compressPaste, setCompressPaste] = useState<boolean>(
    settings.compressPaste != null ? settings.compressPaste : true
  );
  const [copyOverlayButtonText, setCopyOverlayButtonText] = useState("Copy Overlay URL");
  let overlayURL = window.location.origin + "/overlay?domain=" + Runtime?.domain + "&module=" + Runtime?.module;

  if (config.authentication && Runtime?.authKey) {
    overlayURL = overlayURL + "&auth=" + Runtime.authKey;
  }

  // DEBUG
  const [debugCheckbox, setDebugCheckbox] = useState<boolean>(settings.debug != null ? settings.debug : false);
  const [tabValue, setTabValue] = useState<number>(0);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  // OWNER
  const [platform, setPlatform] = useState<string>(config.streamingPlatform);
  const [streamName, setStreamName] = useState<string>(config.streamName);
  const [updateHz, setUpdateHz] = useState<number>(config.updateHz);
  const [auth, setAuth] = useState<boolean>(config.authentication);
  const [strictMode, setStrictMode] = useState<boolean>(config.strictMode);

  const saveSettings = () => {
    localStorage.setItem("nickname", nicknameInput);
    localStorage.setItem("TenorAPIKey", tenorAPIKey);
    UpdateGuestNicknameReducer.call(nicknameInput);

    if (permission && permission.tag === "Owner") {
      const doUpdate =
        platform !== config.streamingPlatform ||
        streamName !== config.streamName ||
        updateHz !== config.updateHz ||
        auth !== config.authentication ||
        strictMode !== config.strictMode;

      if (doUpdate) UpdateConfigReducer.call(platform, streamName, updateHz, auth, strictMode);
    }

    let newSettings = settings;

    newSettings.debug = debugCheckbox;
    newSettings.cursorName = cursorNameCheckbox;
    newSettings.compressUpload = compressUpload;
    newSettings.compressPaste = compressPaste;

    localStorage.setItem("settings", JSON.stringify(newSettings));
    setSettings(newSettings);

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

  const tabWidth = permission && permission.tag === "Owner" ? "25%" : "33%";

  if (isOverlay) return <></>;

  return (
    <Dialog
      open={true}
      id="settingsModal"
      onClose={() => closeModal("settings_modal", modals, setModals)}
      sx={{
        ".MuiDialog-paper": {
          height: "580px !important",
          width: "420px !important",
        },
      }}
    >
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Settings</DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#0a2a47",
          paddingBottom: "3px",
          paddingTop: "10px !important",
          minWidth: "300px !important",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Tabs value={tabValue} onChange={(event, value) => setTabValue(value)} aria-label="settings tabs">
            <Tab sx={{ backgroundColor: "#001529", width: tabWidth }} label="General" />
            <Tab sx={{ backgroundColor: "#001529", width: tabWidth }} label="Advanced" />
            <Tab sx={{ backgroundColor: "#001529", width: tabWidth }} label="Debug" />
            {permission && permission.tag === "Owner" && (
              <Tab sx={{ backgroundColor: "#001529", width: tabWidth }} label="Owner" />
            )}
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

              <div style={{ display: "grid", marginTop: "10px" }}>
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6", paddingTop: "1px" },
                  }}
                  sx={{ alignItems: "start" }}
                  control={
                    <Checkbox
                      onChange={() => handleStreamPlayerInteractable()}
                      defaultChecked={streamPlayerInteractable}
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
                  sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px", maxWidth: "100%" }}
                >
                  You have an outdated Pogly version!{" "}
                  <a href="https://github.com/PoglyApp/pogly-standalone/releases">Grab the new version here</a>.
                </Alert>
              )}
            </div>
          </SettingsTabPanel>
          <SettingsTabPanel value={tabValue} index={1}>
            <div style={{ display: "grid" }}>
              <FormControlLabel
                componentsProps={{
                  typography: { color: "#ffffffa6", paddingTop: "1px" },
                }}
                sx={{ alignItems: "start" }}
                control={
                  <Checkbox
                    onChange={() => setCompressUpload(!compressUpload)}
                    checked={compressUpload}
                    sx={{
                      color: "#ffffffa6",
                      paddingTop: "0px",
                    }}
                  />
                }
                label="Compress uploaded images"
              />

              <FormControlLabel
                componentsProps={{
                  typography: { color: "#ffffffa6", paddingTop: "1px" },
                }}
                sx={{ alignItems: "start" }}
                control={
                  <Checkbox
                    onChange={() => setCompressPaste(!compressPaste)}
                    checked={compressPaste}
                    sx={{ color: "#ffffffa6", paddingTop: "0px" }}
                  />
                }
                label="Compress copied images"
              />
            </div>

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
                  width: "48.5%",
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
                  width: "48.5%",
                }}
                onClick={showDownloadModal}
              >
                Export Data
              </Button>
            </div>

            <div style={{ display: "grid" }}>
              <Button
                variant="outlined"
                startIcon={<ContentPaste />}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  marginTop: "10px",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(overlayURL);

                  setCopyOverlayButtonText("Copied!");

                  setTimeout(() => {
                    setCopyOverlayButtonText("Copy Overlay URL");
                  }, 1000);
                }}
              >
                {copyOverlayButtonText}
              </Button>

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
            <div style={{ display: "grid" }}>
              <FormControlLabel
                componentsProps={{
                  typography: { color: "#ffffffa6", paddingTop: "1px" },
                }}
                sx={{ alignItems: "start" }}
                control={
                  <Checkbox
                    onChange={() => setDebugCheckbox(!debugCheckbox)}
                    checked={debugCheckbox}
                    sx={{ color: "#ffffffa6", paddingTop: "0px" }}
                  />
                }
                label="Enable debug mode"
              />

              <FormControlLabel
                componentsProps={{
                  typography: { color: "#ffffffa6", paddingTop: "1px" },
                }}
                sx={{ alignItems: "start" }}
                control={
                  <Checkbox
                    onChange={(event) => localStorage.setItem("debuglogger", event.target.checked.toString())}
                    defaultChecked={
                      localStorage.getItem("debuglogger") ? JSON.parse(localStorage.getItem("debuglogger")!) : false
                    }
                    sx={{ color: "#ffffffa6", paddingTop: "0px" }}
                  />
                }
                label="Debug logger"
              />
            </div>

            <div style={{ display: "grid", marginTop: "10px" }}>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "#ffffff" },
                  marginTop: "10px",
                }}
                onClick={() => {
                  localStorage.removeItem("poglyQuickSwap");
                }}
              >
                Clear Quick-Swap Modules
              </Button>

              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  color: "#ff5238",
                  borderColor: "#ff5238",
                  "&:hover": { borderColor: "#b23927" },
                  marginTop: "10px",
                }}
                onClick={() => DeleteAllElementsReducer.call()}
              >
                Delete all elements
              </Button>

              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  color: "#ff5238",
                  borderColor: "#ff5238",
                  "&:hover": { borderColor: "#b23927" },
                  marginTop: "10px",
                }}
                onClick={() => {
                  DeleteAllElementsReducer.call();
                  DeleteAllElementDataReducer.call();
                }}
              >
                Delete all element data
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon fontSize="small" sx={{ color: "5cb85c" }} />}
                sx={{
                  color: "#5cb85c",
                  borderColor: "#53a653",
                  "&:hover": { borderColor: "#376e37" },
                  marginTop: "10px",
                }}
                onClick={() => RefreshOverlayReducer.call()}
              >
                Force refresh canvas
              </Button>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon fontSize="small" sx={{ color: "5cb85c" }} />}
                sx={{
                  color: "#5cb85c",
                  borderColor: "#53a653",
                  "&:hover": { borderColor: "#376e37" },
                  marginTop: "10px",
                }}
                onClick={() => RefreshOverlayClearStorageReducer.call()}
              >
                Force hard refresh canvas
              </Button>
            </div>
          </SettingsTabPanel>
          {permission && permission.tag === "Owner" && (
            <SettingsTabPanel value={tabValue} index={3}>
              <div style={{ display: "grid" }}>
                <RadioGroup
                  row
                  sx={{ color: "#ffffffa6", display: "block", textAlign: "center", marginBottom: "10px" }}
                >
                  <FormControlLabel
                    control={
                      <Radio
                        checked={platform === "twitch"}
                        onChange={() => setPlatform("twitch")}
                        sx={{ color: "#ffffffa6" }}
                      />
                    }
                    label="Twitch"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    control={
                      <Radio
                        checked={platform === "youtube"}
                        onChange={() => setPlatform("youtube")}
                        sx={{ color: "#ffffffa6" }}
                      />
                    }
                    label="Youtube"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    control={
                      <Radio
                        checked={platform === "kick"}
                        onChange={() => setPlatform("kick")}
                        sx={{ color: "#ffffffa6" }}
                      />
                    }
                    label="Kick"
                    labelPlacement="top"
                  />
                </RadioGroup>
                {platform === "youtube" && (
                  <Alert
                    variant="filled"
                    severity="warning"
                    sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginBottom: "20px" }}
                  >
                    Youtubers! Enter your CHANNEL_ID found{" "}
                    <a href="https://www.youtube.com/account_advanced" target="_blank" rel="noreferrer">
                      here
                    </a>{" "}
                    below.
                  </Alert>
                )}
                <StyledInput
                  focused={false}
                  label={platform !== "youtube" ? "Channel Name" : "CHANNEL_ID"}
                  color="#ffffffa6"
                  onChange={setStreamName}
                  defaultValue={streamName}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "grid", marginTop: "20px", marginBottom: "20px" }}>
                  <StyledInput
                    focused={false}
                    label="Update Hz (Refresh Rate)"
                    color="#ffffffa6"
                    onChange={(event: any) => {
                      setUpdateHz(Number(event));
                    }}
                    defaultValue={updateHz.toString()}
                    style={{ width: "100%" }}
                  />
                </div>
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6", paddingTop: "1px" },
                  }}
                  sx={{ alignItems: "start" }}
                  control={
                    <Checkbox
                      onChange={() => setStrictMode(!strictMode)}
                      checked={strictMode}
                      sx={{
                        color: "#ffffffa6",
                        paddingTop: "0px",
                      }}
                    />
                  }
                  label="Strict Mode"
                />
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6", paddingTop: "1px" },
                  }}
                  sx={{ alignItems: "start" }}
                  control={
                    <Checkbox
                      onChange={() => setAuth(!auth)}
                      checked={auth}
                      sx={{
                        color: "#ffffffa6",
                        paddingTop: "0px",
                      }}
                    />
                  }
                  label="Authentication Required"
                />
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
              </div>
            </SettingsTabPanel>
          )}
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
