import { Identity } from "spacetimedb";
import { useEffect, useState } from "react";
import {
  Alert,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { StyledInput } from "../StyledComponents/StyledInput";
import { StyledButton } from "../StyledComponents/StyledButton";
import { DebugLogger } from "../../Utility/DebugLogger";
import { DbConnection, Guests } from "../../module_bindings";

interface IProps {
  client: DbConnection;
  identity?: Identity;
  setNickname: Function;
}

export const SetNicknameModal = (props: IProps) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [nickname, setNickname] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOverlay) {
      DebugLogger("Is overlay, setting nickname to overlay");
      props.setNickname("Overlay");
    }
  }, [props, isOverlay]);

  const handleLogin = () => {
    DebugLogger("Handling log in");
    if (!props.identity || !nickname || nickname === "") return;

    const alreadyExists = Array.from(props.client.db.guests.iter()).find((g: Guests) => g.nickname === nickname);

    if (alreadyExists) {
      DebugLogger("Nickname taken");
      return setError("That nickname is taken.");
    } else {
      setError("");
    }

    if (rememberMe) localStorage.setItem("nickname", nickname);

    props.client.reducers.updateGuestNickname(nickname);
    props.setNickname(nickname);
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={true}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        Welcome guest!
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <DialogContentText sx={{ color: "#ffffffa6", textAlign: "center", paddingBottom: "8px" }}>
          Please input a nickname
        </DialogContentText>
        {error !== "" && (
          <Alert severity="error" sx={{ typography: { color: "red" } }}>
            {error}
          </Alert>
        )}
        <StyledInput focused={true} label="Nickname" color="#ffffffa6" onChange={setNickname} defaultValue={""} />
        <FormGroup>
          <FormControlLabel
            componentsProps={{
              typography: { color: "#ffffffa6" },
            }}
            control={
              <Checkbox
                defaultChecked
                sx={{ color: "#ffffffa6" }}
                onChange={() => setRememberMe((remember) => !remember)}
              />
            }
            label="Remember me"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", textAlign: "center", display: "block" }}>
        <StyledButton
          disabled={nickname === "" || nickname.length < 3 || nickname.length > 15 ? true : false}
          label="Enter"
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleLogin}
        />
      </DialogActions>
    </Dialog>
  );
};
