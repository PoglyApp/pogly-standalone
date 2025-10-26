import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import { StyledInput } from "../StyledComponents/StyledInput";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface IProps {
  Runtime: any;
}

export const LocalOverridesModal = ({ Runtime }: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const [streamOverride, setStreamOverride] = useState<string>();

  const [sevenTVUsername, setSevenTVUsername] = useState<string>();
  const [streamPlatform, setStreamPlatform] = useState<string>("Twitch");

  const [valueInitialization, setValueInitialization] = useState<boolean>(false);

  useEffect(() => {
    if (!Runtime) return;

    const streamOverrides = localStorage.getItem("streamOverride");
    const sevenTVOverrides = localStorage.getItem("sevenTVOverrides");

    if (streamOverrides) {
      const overrideJson = JSON.parse(streamOverrides);
      const currentOverride = overrideJson.find((obj: any) => obj.module === Runtime.module);

      if (currentOverride) {
        setStreamOverride(currentOverride.override);
      }
    }

    if (sevenTVOverrides) {
      const overrideJson = JSON.parse(sevenTVOverrides);
      const currentOverride = overrideJson.find((obj: any) => obj.module === Runtime.module);

      if (currentOverride) {
        setSevenTVUsername(currentOverride.override);
        setStreamPlatform(currentOverride.platform);
      }
    }

    setValueInitialization(true);
  }, []);

  const saveStreamOverride = () => {
    const streamOverrides = localStorage.getItem("streamOverride");

    if (streamOverrides && Runtime) {
      let oldList = JSON.parse(streamOverrides);
      let oldOverride = oldList.find((obj: any) => obj.module === Runtime.module);

      if (!oldOverride && !streamOverride) return;

      if (oldOverride) {
        if (!streamOverride) {
          oldList = oldList.filter((obj: any) => obj.module !== Runtime.module);
        } else {
          oldOverride.override = streamOverride;
        }
      } else {
        oldList.push({ module: Runtime.module, override: streamOverride });
      }

      localStorage.setItem("streamOverride", JSON.stringify(oldList));
    } else {
      if (streamOverride && Runtime) {
        localStorage.setItem("streamOverride", JSON.stringify([{ module: Runtime.module, override: streamOverride }]));
      }
    }
  };

  const saveSevenTVOverride = () => {
    if (!Runtime) return;

    const savedSevenTVOverrides = localStorage.getItem("sevenTVOverrides");
    const newOverride = { module: Runtime.module, override: sevenTVUsername, platform: streamPlatform };

    if (!savedSevenTVOverrides || savedSevenTVOverrides.length === 0) {
      if (!sevenTVUsername || sevenTVUsername.length === 0) return;

      return localStorage.setItem("sevenTVOverrides", JSON.stringify([newOverride]));
    }

    const oldOverrides = JSON.parse(savedSevenTVOverrides);
    const oldOverride = oldOverrides.find((obj: any) => obj.module === Runtime.module);
    const newOverrides = oldOverrides.filter((obj: any) => obj.module !== Runtime.module);

    if (oldOverride && oldOverride.override === sevenTVUsername && oldOverride.platform === streamPlatform) return;

    if (!sevenTVUsername || sevenTVUsername.length === 0) {
      return localStorage.setItem("sevenTVOverrides", JSON.stringify(newOverrides));
    }

    newOverrides.push(newOverride);
    return localStorage.setItem("sevenTVOverrides", JSON.stringify(newOverrides));
  };

  const handleCloseModal = () => {
    saveStreamOverride();
    saveSevenTVOverride();
    closeModal("localOverrides_modal", modals, setModals);
  };

  return (
    <Dialog
      open={true}
      onClose={handleCloseModal}
      sx={{
        ".MuiDialog-paper": {
          height: "fit-content !important",
          width: "420px !important",
        },
      }}
    >
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        Local overrides
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        {valueInitialization ? (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <Typography
                variant="subtitle2"
                color="#ffffffa6"
                sx={{
                  marginBottom: "5px",
                }}
              >
                Override local stream preview
              </Typography>
              <StyledInput
                focused={false}
                label="Direct stream embed URL"
                color="#ffffffa6"
                onChange={setStreamOverride}
                defaultValue={streamOverride}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <Typography
                variant="subtitle2"
                color="#ffffffa6"
                sx={{
                  marginBottom: "3px",
                }}
              >
                Override 7TV channel name
              </Typography>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StyledInput
                  focused={false}
                  label="7TV username"
                  color="#ffffffa6"
                  onChange={setSevenTVUsername}
                  defaultValue={sevenTVUsername}
                  style={{}}
                />
                <RadioGroup row sx={{ color: "#ffffffa6", display: "block", textAlign: "center" }}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={streamPlatform === "Twitch"}
                        onChange={() => setStreamPlatform("Twitch")}
                        sx={{ color: "#ffffffa6" }}
                      />
                    }
                    label="Twitch"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    control={
                      <Radio
                        checked={streamPlatform === "KICK"}
                        onChange={() => setStreamPlatform("KICK")}
                        sx={{ color: "#ffffffa6" }}
                      />
                    }
                    label="KICK"
                    labelPlacement="top"
                  />
                </RadioGroup>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
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
          onClick={() => closeModal("localOverrides_modal", modals, setModals)}
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
