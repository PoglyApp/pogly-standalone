import {
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
import { useMemo, useState } from "react";
import { StyledInput } from "../StyledComponents/StyledInput";
import { DebugLogger } from "../../Utility/DebugLogger";
import { QuickSwapType } from "../../Types/General/QuickSwapType";
import { AuthStatusType } from "../../Types/General/AuthStatusType";
import { jwtDecode } from "jwt-decode";

interface IProp {
  setInstanceSettings: Function;
}

export const ChooseInstanceModal = (props: IProp) => {
  const [type, setType] = useState<string>("Cloud");
  const [customDomain, setCustomDomain] = useState<string>("");
  const [moduleName, setModuleName] = useState<string>("");
  const [authKey, setAuthKey] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(true);
  const twitchAccessToken = localStorage.getItem("twitchAccessToken");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const twitchIdToken = localStorage.getItem("twitchIdToken");
  const [authStatus, setAuthStatus] = useState<AuthStatusType>(
    twitchIdToken ? AuthStatusType.TwitchAuth : AuthStatusType.NotAuthenticated
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const handleAuth = (type: AuthStatusType) => {
    DebugLogger("Halding auth selection");
    setIsRedirecting(true);
    setAuthStatus(type);

    const CLIENT_ID = "2zrg60xlectlfv7pycwlt4acoabs1p"; // twitch oauth here!
    const REDIRECT_URI = "http://localhost:3006/callback";
    const SCOPES = "openid";

    const twitchAuthUrl =
      "https://id.twitch.tv/oauth2/authorize" +
      `?client_id=${CLIENT_ID}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&response_type=token+id_token` +
      `&scope=${encodeURIComponent(SCOPES)}`;

    window.location.href = twitchAuthUrl;
  };

  const handleSave = () => {
    DebugLogger("Handling instance save");
    let domain: string = "";

    switch (type) {
      case "Cloud":
        domain = "wss://pogly.spacetimedb.com";
        break;
      case "Local":
        domain = "ws://127.0.0.1:3000";
        break;
      case "Custom":
        domain = customDomain;
        break;
    }

    props.setInstanceSettings({
      token: twitchIdToken,
      domain: domain,
      module: moduleName,
      authKey: authKey,
      remember: remember,
    });

    if (remember) {
      DebugLogger("Saving instance values");
      localStorage.setItem("stdbConnectDomain", domain);
      localStorage.setItem("stdbConnectModule", moduleName);
      localStorage.setItem("stdbConnectModuleAuthKey", authKey);

      const qSwap = localStorage.getItem("poglyQuickSwap");
      let existingSwap: QuickSwapType[] = [];

      try {
        if (qSwap) existingSwap = JSON.parse(qSwap);
      } catch (error) {
        //do nothing
      }

      const newConnection: QuickSwapType = { domain: domain, module: moduleName, nickname: null, auth: authKey };

      if (existingSwap) {
        if (existingSwap.some((x) => x.module === moduleName)) return;
        existingSwap.push(newConnection);
        localStorage.setItem("poglyQuickSwap", JSON.stringify(existingSwap));
      } else {
        let swapArray: QuickSwapType[] = [newConnection];
        localStorage.setItem("poglyQuickSwap", JSON.stringify(swapArray));
      }
    }

    setIsModalOpen(false);
  };

  const preferredUsername = useMemo(() => {
    try {
      if (!twitchIdToken) return null;
      const decoded: any = jwtDecode(twitchIdToken);
      return decoded.preferred_username ?? null;
    } catch {
      return null;
    }
  }, [twitchIdToken]);


  if (isOverlay || isRedirecting) {
    return <></>;
  }

  return (
    <Dialog open={isModalOpen}>
      {authStatus === AuthStatusType.NotAuthenticated ? (
        <>
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", width: "370px", textAlign: "center" }}>
            Pogly Standalone
          </DialogTitle>

          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            <FormGroup sx={{ gap: "10px" }}>
              <Button
                variant="outlined"
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#6441a5",
                  backgroundColor: "#6441a5",
                  "&:hover": { borderColor: "#6441a5b2", backgroundColor: "#6441a5b2" },
                  "&:disabled": {
                    borderColor: "gray",
                    color: "gray",
                  },
                  columnGap: "10px",
                }}
                onClick={() => {
                  handleAuth(AuthStatusType.TwitchAuth);
                }}
              >
                <img style={{ width: "16px", height: "16px" }} src="./assets/twitch.png" /> Login with Twitch
              </Button>
              <Button
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
                onClick={() => {
                  setAuthStatus(AuthStatusType.LegacyAuth);
                }}
              >
                Legacy Login
              </Button>
            </FormGroup>
          </DialogContent>

          <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "10px", display: "grid" }}>
            <div style={{ position: "fixed" }}>
              <p
                style={{ margin: "0", paddingLeft: "10px", paddingBottom: "10px", fontSize: "12px", color: "#ffffffa6" }}
              >
                Version: {process.env.REACT_APP_VERSION}
              </p>
            </div>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", width: "370px", textAlign: "center" }}>
          {twitchIdToken
            ? (
              <>
                Welcome{" "}
                <span style={{ color: "#9146FF" }}>
                  {preferredUsername}
                </span>
                , Connect below.
                <br />
                <Button
                  variant="text"
                  sx={{
                    fontSize: "10px",
                    color: "#ffffffa6",
                  }}
                  onClick={() => {
                    localStorage.removeItem("twitchIdToken");
                    localStorage.removeItem("twitchAccessToken");
                    window.location.reload();
                  }}
                >
                  Not you? Click here to switch accounts
                </Button>
              </>
            ) : (
              "Connect below w/ Legacy Auth"
            )}
          </DialogTitle>
          

          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            <FormGroup sx={{ gap: "20px" }}>
              <RadioGroup row sx={{ color: "#ffffffa6", display: "block", textAlign: "center" }}>
                <FormControlLabel
                  control={
                    <Radio checked={type === "Cloud"} onChange={() => setType("Cloud")} sx={{ color: "#ffffffa6" }} />
                  }
                  label="Cloud"
                  labelPlacement="top"
                />
                <FormControlLabel
                  control={
                    <Radio checked={type === "Local"} onChange={() => setType("Local")} sx={{ color: "#ffffffa6" }} />
                  }
                  label="Local"
                  labelPlacement="top"
                />
                <FormControlLabel
                  control={
                    <Radio checked={type === "Custom"} onChange={() => setType("Custom")} sx={{ color: "#ffffffa6" }} />
                  }
                  label="Custom"
                  labelPlacement="top"
                />
              </RadioGroup>

              {type === "Custom" && (
                <StyledInput
                  focused={true}
                  label="Custom domain"
                  color="#ffffffa6"
                  onChange={(text: any) => setCustomDomain(text)}
                  defaultValue={""}
                  placeholder="ws(s)://127.0.0.1"
                />
              )}

              <StyledInput
                focused={true}
                label="Module name"
                color="#ffffffa6"
                onChange={(text: any) => setModuleName(text)}
                defaultValue={""}
              />
              <div style={{ display: "grid" }}>
                <StyledInput
                  focused={false}
                  label="Authentication key"
                  color="#ffffffa6"
                  onChange={(text: any) => setAuthKey(text)}
                  defaultValue={""}
                />
                <Typography variant="subtitle2" color="#ffffffa6">
                  (Only if Required by Module)
                </Typography>
              </div>

              <div style={{ display: "grid" }}>
                <FormControlLabel
                  componentsProps={{
                    typography: { color: "#ffffffa6" },
                  }}
                  control={
                    <Checkbox
                      defaultChecked
                      sx={{ color: "#ffffffa6", height: "20px" }}
                      onChange={() => setRemember((remember) => !remember)}
                    />
                  }
                  label="Remember connection"
                />
                <Typography variant="subtitle2" color="#ffffffa6">
                  (Can be reset in settings menu)
                </Typography>
              </div>
            </FormGroup>
          </DialogContent>

          <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "10px", display: "grid" }}>
            <div style={{ position: "fixed" }}>
              <p style={{ margin: "0", paddingLeft: "10px", fontSize: "12px", color: "#ffffffa6" }}>
                Version: {process.env.REACT_APP_VERSION}
              </p>
            </div>
            <div>
              <Button
                disabled={moduleName === "" ? true : false}
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
                Connect
              </Button>
            </div>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
