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
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PasswordIcon from "@mui/icons-material/Password";
import ContentPaste from "@mui/icons-material/ContentPaste";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import { BackupModal } from "./BackupModal";
import { SettingsContext } from "../../Contexts/SettingsContext";
import { ModalContext } from "../../Contexts/ModalContext";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { InstancePasswordModal } from "./InstancePasswordModal";
import { SettingsTabPanel } from "../Settings/SettingsTabPanel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ModeratorListModal } from "./ModeratorListModal";
import { Config } from "../../module_bindings";
import { useGetVersionNumber } from "../../Hooks/useGetVersionNumber";
import { PermissionTypes } from "../../Types/General/PermissionType";
import { getPermissions } from "../../Utility/PermissionsHelper";
import { SpacetimeContextType } from "../../Types/General/SpacetimeContextType";

export const SettingsModal = () => {
  const spacetimeDB: SpacetimeContextType = useContext(SpacetimeContext);
  const config: Config = spacetimeDB.Client.db.config.version.find(0)!
  const permissions: PermissionTypes[] = getPermissions(spacetimeDB, spacetimeDB.Identity.identity);
  const isOwner = permissions.includes(PermissionTypes.Owner);

  const isPoglyInstance: Boolean = spacetimeDB.Runtime?.domain === "wss://maincloud.spacetimedb.com";

  const { settings, setSettings } = useContext(SettingsContext);
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const [versionNumber, setVersionNumber] = useState<string>();

  // GENERAL
  const stream = document.getElementById("stream")!;
  const [nicknameInput, setNicknameInput] = useState<string>(localStorage.getItem("nickname")!);
  const [tenorAPIKey, setTenorAPIKey] = useState<string>(localStorage.getItem("TenorAPIKey")!);
  const [cursorNameCheckbox, setCursorNameCheckbox] = useState<boolean>(true);
  const [streamPlayerInteractable, setStreamPlayerInteractable] = useState<boolean>(
    stream.style.pointerEvents === "none" ? false : true
  );
  const [urlAsDefault, setUrlAsDefault] = useState<boolean>(
    settings.urlAsDefault != null ? settings.urlAsDefault : false
  );
  const [streamQuality, setStreamQuality] = useState<string>(
    localStorage.getItem("streamQuality") ? localStorage.getItem("streamQuality")! : "720p60"
  );

  // ADVANCED
  const [compressUpload, setCompressUpload] = useState<boolean>(
    settings.compressUpload != null ? settings.compressUpload : true
  );
  const [compressPaste, setCompressPaste] = useState<boolean>(
    settings.compressPaste != null ? settings.compressPaste : true
  );
  const [copyOverlayButtonText, setCopyOverlayButtonText] = useState("Copy Overlay URL");
  let overlayURL = window.location.origin + "/overlay?module=" + spacetimeDB.Runtime?.module;

  if (!isPoglyInstance) overlayURL = overlayURL + "&domain=" + spacetimeDB.Runtime?.domain;

  const [streamOverride, setStreamOverride] = useState<string>("");

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

  useGetVersionNumber(setVersionNumber);

  const saveSettings = () => {
    localStorage.setItem("nickname", nicknameInput);
    localStorage.setItem("TenorAPIKey", tenorAPIKey);
    spacetimeDB.Client.reducers.updateGuestNickname(nicknameInput);

    if (permissions && isOwner) {
      const doUpdate =
        platform !== config.streamingPlatform ||
        streamName !== config.streamName ||
        updateHz !== config.updateHz ||
        auth !== config.authentication ||
        strictMode !== config.strictMode;

      if (doUpdate) spacetimeDB.Client.reducers.updateConfig(platform, streamName, updateHz, auth, strictMode);
    }

    let newSettings = settings;

    newSettings.debug = debugCheckbox;
    newSettings.cursorName = cursorNameCheckbox;
    newSettings.compressUpload = compressUpload;
    newSettings.compressPaste = compressPaste;
    newSettings.urlAsDefault = urlAsDefault;

    const streamOverrides = localStorage.getItem("streamOverride");

    if (streamOverrides && spacetimeDB.Runtime) {
      let oldList = JSON.parse(streamOverrides);
      let oldOverride = oldList.find((obj: any) => obj.module === spacetimeDB.Runtime?.module);

      if (!oldOverride && !streamOverride) return;

      if (oldOverride) {
        if (!streamOverride) {
          oldList = oldList.filter((obj: any) => obj.module !== spacetimeDB.Runtime?.module);
        } else {
          oldOverride.override = streamOverride;
        }
      } else {
        oldList.push({ module: spacetimeDB.Runtime.module, override: streamOverride });
      }

      localStorage.setItem("streamOverride", JSON.stringify(oldList));
    } else {
      if (streamOverride && spacetimeDB.Runtime) {
        localStorage.setItem(
          "streamOverride",
          JSON.stringify([{ module: spacetimeDB.Runtime.module, override: streamOverride }])
        );
      }
    }

    localStorage.setItem("settings", JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  useEffect(() => {
    setSettings(settings);

    const streamInteractable = document.getElementById("stream")?.style.pointerEvents;

    setStreamPlayerInteractable(streamInteractable === "none" ? false : true);

    const streamOverrides = localStorage.getItem("streamOverride");
    if (!streamOverrides || !spacetimeDB.Runtime) return;

    const overrideJson = JSON.parse(streamOverrides);
    const currentOverride = overrideJson.find((obj: any) => obj.module === spacetimeDB.Runtime?.module);

    if (!currentOverride) return;

    setStreamOverride(currentOverride.override);
  }, [settings, setSettings, spacetimeDB.Runtime]);

  function clearConnectionSettings() {
    localStorage.removeItem("stdbConnectDomain");
    localStorage.removeItem("stdbConnectModule");
    localStorage.removeItem("stdbConnectModuleAuthKey");
    closeModal("settings_modal", modals, setModals);
  }

  const showInstancePassword = () => {
    setModals((oldModals: any) => [...oldModals, <InstancePasswordModal key="instancePassword_modal" />]);
  };

  const showUploadModal = () => {
    setModals((oldModals: any) => [...oldModals, <BackupModal key="backup_modal" download={false} />]);
  };

  const showDownloadModal = () => {
    setModals((oldModals: any) => [...oldModals, <BackupModal key="backup_modal" download={true} />]);
  };

  const showModeratorListModal = () => {
    setModals((oldModals: any) => [...oldModals, <ModeratorListModal key="moderatorList_modal" />]);
  };

  // const showLocalOverridesModal = () => {
  //   setModals((oldModals: any) => [...oldModals, <LocalOverridesModal key="localOverrides_modal" />]);
  // };

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

  const handleStreamQuality = (event: any) => {
    setStreamQuality(event.target.value);
    localStorage.setItem("streamQuality", event.target.value);
    window.location.reload();
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noreferrer");
  };

  const handleCloseModal = () => {
    saveSettings();
    closeModal("settings_modal", modals, setModals);
  };

  const tabWidth = permissions && isOwner ? "25%" : "33%";

  if (isOverlay) return <></>;

  return (
    <Dialog
      open={true}
      id="settingsModal"
      onClose={() => closeModal("settings_modal", modals, setModals)}
      sx={{
        ".MuiDialog-paper": {
          height: "630px !important",
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
            {permissions && isOwner && (
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

                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6", paddingTop: "1px" },
                  }}
                  sx={{ alignItems: "start" }}
                  control={
                    <Checkbox
                      onChange={(event: any, checked: boolean) => setUrlAsDefault(checked)}
                      defaultChecked={urlAsDefault}
                      sx={{ color: "#ffffffa6", paddingTop: "0px" }}
                    />
                  }
                  label="Set URL as default upload type"
                />
              </div>

              {config.streamingPlatform === "twitch" && (
                <FormControl fullWidth sx={{ color: "#ffffffa6 !important", marginTop: "15px" }}>
                  <InputLabel id="qualityselector" sx={{ color: "#ffffffa6", ":focus": { color: "red !important" } }}>
                    Stream quality
                  </InputLabel>
                  <Select
                    labelId="qualityselector"
                    label="Stream quality"
                    value={streamQuality}
                    onChange={(event) => {
                      handleStreamQuality(event);
                    }}
                    sx={{ ".MuiSvgIcon-root": { fill: "#ffffffa6", "&:focus": { color: "red !important" } } }}
                  >
                    <MenuItem value={"chunked"}>1080p60 (Source)</MenuItem>
                    <MenuItem value={"720p60"}>720p60</MenuItem>
                    <MenuItem value={"480p"}>480p</MenuItem>
                    <MenuItem value={"360p"}>360p</MenuItem>
                    <MenuItem value={"160p"}>160p</MenuItem>
                  </Select>
                </FormControl>
              )}

              {versionNumber !== `${process.env.REACT_APP_VERSION}` && (
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

              <Button
                variant="outlined"
                startIcon={<PublishedWithChangesIcon />}
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  marginTop: "10px",
                }}
                //onClick={showLocalOverridesModal}
              >
                Local override settings
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
                onClick={() => spacetimeDB.Client.reducers.deleteAllElements()}
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
                  spacetimeDB.Client.reducers.deleteAllElements();
                  spacetimeDB.Client.reducers.deleteAllElementData();
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
                onClick={() => spacetimeDB.Client.reducers.refreshOverlay()}
              >
                Force refresh overlay
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
                onClick={() => spacetimeDB.Client.reducers.refreshOverlayClearStorage()}
              >
                Force hard refresh overlay
              </Button>
            </div>
          </SettingsTabPanel>
          {permissions && isOwner && (
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
                      onChange={() => {
                        if (!config.authentication) {
                          showInstancePassword();
                        }

                        setAuth(!auth);
                      }}
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

                <Button
                  variant="outlined"
                  sx={{
                    color: "#00ad03",
                    borderColor: "#00ad03cc",
                    "&:hover": { borderColor: "#00ad03" },
                    marginTop: "10px",
                  }}
                  onClick={showModeratorListModal}
                >
                  Moderator list
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
          onClick={handleCloseModal}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
