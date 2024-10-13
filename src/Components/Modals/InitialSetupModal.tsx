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
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import Config from "../../module_bindings/config";
import SetConfigReducer from "../../module_bindings/set_config_reducer";
import { StyledInput } from "../StyledComponents/StyledInput";
import { ConnectionConfigType } from "../../Types/ConfigTypes/ConnectionConfigType";
import { UploadElementDataFromString } from "../../Utility/UploadElementData";
import { useGetDefaultElements } from "../../Hooks/useGetDefaultElements";
import { DebugLogger } from "../../Utility/DebugLogger";

interface IProp {
  config: Config;
  connectionConfig: ConnectionConfigType;
  setInstanceConfigured: Function;
  versionNumber: string;
}

export const InitialSetupModal = (props: IProp) => {
  const [platform, setPlatform] = useState<string>(props.config.streamingPlatform);
  const [channel, setChannel] = useState<string>(props.config.streamName);
  const [debug, setDebug] = useState<boolean>(props.config.debugMode);
  const [updateHz, setUpdateHz] = useState<string>(props.config.updateHz.toString());
  const [editorBorder, setEditorBorder] = useState<string>("200");
  const [authentication, setAuthentication] = useState<boolean>(props.config.authentication);
  const [authKey, setAuthKey] = useState<string>("");
  const [strictMode, setStrictMode] = useState<boolean>(props.config.strictMode);
  const [overlayURL, setOverlayURL] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [initializing, setInitializing] = useState<boolean>(false);
  const [defaultElements, setDefaultElements] = useState<string>("");

  const [copyOverlayButtonText, setCopyOverlayButtonText] = useState("Copy Overlay URL");
  const [copyAuthButtonText, setAuthButtonText] = useState("Copy Auth Token");

  const [error, setError] = useState<string>("");

  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const regex = /^[0-9a-zA-Z]+$/;
  const badCharError = "Special characters are not supported in Authentication Key at this time.";

  useGetDefaultElements(setDefaultElements);

  useEffect(() => {
    DebugLogger("Creating overlay URL");
    let baseUrl =
      window.location.origin +
      "/overlay?domain=" +
      props.connectionConfig.domain +
      "&module=" +
      props.connectionConfig.module;

    if (authentication) baseUrl = baseUrl + "&auth=" + authKey;

    setOverlayURL(baseUrl);
  }, [authKey, authentication, props.connectionConfig]);

  const handleAuthKeyChange = (text: any) => {
    DebugLogger("Handling auth key change");
    if (!regex.test(text)) {
      setError(badCharError);
      return;
    }
      if (error === badCharError) setError("");

      setAuthKey(text);
  };

  const handleSave = () => {
    console.log(authKey);
    DebugLogger("Saving instance settings");
    const regex = new RegExp("^[0-9]+$");

    if (!regex.test(updateHz)) {
      DebugLogger("Hz has to be a number");
      setUpdateHz("");
      return setError("Update Hz has to be a number.");
    }

    SetConfigReducer.call(
      platform,
      channel,
      debug,
      Number.parseInt(updateHz),
      Number.parseInt(editorBorder),
      authentication,
      strictMode,
      authKey
    );

    (async () => {
      UploadElementDataFromString(defaultElements);
      setInitializing(true);
    })();

    setTimeout(function () {
      setIsModalOpen(false);
      props.setInstanceConfigured(true);
      window.location.reload();
    }, 2750);
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={isModalOpen}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Pogly Standalone Initial Setup</DialogTitle>

      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
        <FormGroup sx={{ gap: "20px" }}>
          <RadioGroup row sx={{ color: "#ffffffa6", display: "block", textAlign: "center" }}>
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
                <Radio checked={platform === "kick"} onChange={() => setPlatform("kick")} sx={{ color: "#ffffffa6" }} />
              }
              label="Kick"
              labelPlacement="top"
            />
          </RadioGroup>

          {platform === "youtube" && (
            <Alert variant="filled" severity="warning" sx={{ backgroundColor: "#f57c00 !important", color: "#212121" }}>
              Youtubers! Enter your CHANNEL_ID found{" "}
              <a href="https://www.youtube.com/account_advanced" target="_blank" rel="noreferrer">
                here
              </a>{" "}
              below.
            </Alert>
          )}

          <StyledInput
            focused={true}
            label={platform !== "youtube" ? "Channel Name" : "CHANNEL_ID"}
            color="#ffffffa6"
            onChange={(text: any) => setChannel(text)}
            defaultValue={""}
          />

          <StyledInput
            focused={false}
            label="Element Update Hz"
            color="#ffffffa6"
            onChange={(text: any) => setUpdateHz(text)}
            defaultValue={"120"}
          />

          {authentication && (
            <StyledInput
              focused={true}
              label="Authentication Key"
              color="#ffffffa6"
              onChange={handleAuthKeyChange}
              value={authKey}
              defaultValue={""}
            />
          )}

          <div style={{ display: "grid" }}>
            <FormControlLabel
              componentsProps={{
                typography: { color: "#ffffffa6" },
              }}
              control={
                <Checkbox sx={{ color: "#ffffffa6", height: "20px" }} onChange={() => setDebug((debug) => !debug)} />
              }
              label="Debug Mode"
            />
            <Typography variant="subtitle2" color="#ffffffa6">
              (Increased server logging)
            </Typography>
          </div>

          <FormControlLabel
            componentsProps={{
              typography: { color: "#ffffffa6" },
            }}
            control={
              <Checkbox
                sx={{ color: "#ffffffa6", height: "20px" }}
                onChange={() => setAuthentication((authentication) => !authentication)}
              />
            }
            label="Authentication Required"
          />

          <FormControlLabel
            componentsProps={{
              typography: { color: "#ffffffa6" },
            }}
            control={
              <Checkbox
                sx={{ color: "#ffffffa6", height: "20px" }}
                onChange={() => setStrictMode((strictMode) => !strictMode)}
              />
            }
            label="Strict Mode"
          />

          <Button
            variant="outlined"
            title="This is your token to prove that you are the owner of this Pogly instance. Keep this saved somewhere in case your local cache gets cleared!"
            onClick={() => {
              navigator.clipboard.writeText(localStorage.getItem("stdbToken")!);
              setAuthButtonText("Copied!");

              setTimeout(() => {
                setAuthButtonText("Copy Auth Token");
              }, 1000);
            }}
          >
            {copyAuthButtonText}
          </Button>

          <Button
            variant="outlined"
            title={overlayURL}
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
        </FormGroup>

        {error !== "" && (
          <Alert
            variant="filled"
            severity="warning"
            sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px", maxWidth: "280px" }}
          >
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px" }}>
        {initializing ? (
          <Typography variant="subtitle2" color="#ffffffa6">
            Initializing...
          </Typography>
        ) : (
          <Button
            disabled={
              error !== "" || channel === "" || updateHz === "" || (authentication && authKey === "") ? true : false
            }
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
            Setup
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
