import { useContext, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { StyledButton } from "../StyledComponents/StyledButton";
import { ModalContext } from "../../Contexts/ModalContext";
import { styled } from "styled-components";
import { StyledInput } from "../StyledComponents/StyledInput";
import { toast } from "react-toastify";

interface IProps {
  module: string;
  setContextMenu: Function;
}

export const QuickSwapNicknameModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const [nickname, setNickname] = useState<string>("");

  const handleSave = () => {
    const modules = localStorage.getItem("poglyQuickSwap");
    if (!modules)
      return console.log("Failed to save module nickname because modules could not be found in localstorage.");

    let moduleJson = JSON.parse(modules);
    let target = moduleJson.find((obj: any) => obj.module === props.module);

    target.nickname = nickname;

    localStorage.setItem("poglyQuickSwap", JSON.stringify(moduleJson));

    toast.success(`Nickname for ${props.module} saved successfully`, {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "dark",
    });

    handleOnClose();
  };

  const handleOnClose = () => {
    props.setContextMenu(null);
    closeModal("quickswapnickname_modal", modals, setModals);
  };

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        Set module nickname
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <div style={{ display: "grid", color: "#ffffffa6" }}>
          <span style={{ fontSize: "12px" }}>Module: {props.module}</span>

          <StyledInput
            focused={true}
            label="Nickname"
            color="#ffffffa6"
            onChange={setNickname}
            defaultValue={""}
            style={{ marginTop: "10px" }}
          />
        </div>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", textAlign: "center", display: "block" }}>
        <StyledButton
          disabled={false}
          label="Cancel"
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleOnClose}
        />
        <StyledButton
          disabled={nickname.length === 0 ? true : false}
          label="Save"
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleSave}
        />
      </DialogActions>
    </Dialog>
  );
};

const StyledTextarea = styled.textarea`
  background-color: #0a2a47;
  color: #ffffffa6;
  border-color: #ffffffa6;
  padding: 8px;
`;
