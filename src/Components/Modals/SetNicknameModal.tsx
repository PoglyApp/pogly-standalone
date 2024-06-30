import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { useEffect, useState } from "react";
import Guests from "../../module_bindings/guests";
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
import UpdateGuestNicknameReducer from "../../module_bindings/update_guest_nickname_reducer";

interface IProps {
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
      props.setNickname("Overlay");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    if (!props.identity || !nickname || nickname === "") return;

    const alreadyExists = Array.from(Guests.filterByNickname(nickname));

    if (alreadyExists.length > 0) {
      return setError("That nickname is taken.");
    } else {
      setError("");
    }

    if (rememberMe) localStorage.setItem("nickname", nickname);

    UpdateGuestNicknameReducer.call(nickname);
    props.setNickname(nickname);
  };

  if(isOverlay) return(<></>);

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
