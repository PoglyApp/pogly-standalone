import { Menu, MenuItem, Paper, Tooltip } from "@mui/material";
import styled from "styled-components";
import { DebugLogger } from "../../Utility/DebugLogger";
import { useContext } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import { QuickSwapNicknameModal } from "../../Components/Modals/QuickSwapNicknameModal";
import { toast } from "react-toastify";
import { QuickSwapType } from "../../Types/General/QuickSwapType.js";

interface IProps {
  contextMenu: any;
  setContextMenu: Function;
}

export const QuickSwapContextMenu = (props: IProps) => {
  const { setModals } = useContext(ModalContext);

  const openNicknameModal = () => {
    DebugLogger("Opening edit quick swap nickanme modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <QuickSwapNicknameModal
        key="quickswapnickname_modal"
        module={props.contextMenu.module}
        setContextMenu={props.setContextMenu}
      />,
    ]);
  };

  const clearNickname = () => {
    const modules = localStorage.getItem("poglyQuickSwap");
    if (!modules) return;

    let moduleJson: QuickSwapType[] = JSON.parse(modules);
    let target = moduleJson.find((obj: QuickSwapType) => obj.module === props.contextMenu.module);

    if (!target) return;

    target.nickname = null;

    localStorage.setItem("poglyQuickSwap", JSON.stringify(moduleJson));

    toast.success(`Nickname for ${props.contextMenu.module} deleted successfully`, {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "dark",
    });

    handleClose();
  };

  const deleteQuickswap = () => {
    const modules = localStorage.getItem("poglyQuickSwap");
    if (!modules) return;

    const moduleJson = JSON.parse(modules).filter((obj: any) => obj.module !== props.contextMenu.module);

    const newJson: QuickSwapType[] = moduleJson ? moduleJson : [];

    localStorage.setItem("poglyQuickSwap", JSON.stringify(newJson));

    toast.success(`Deleted ${props.contextMenu.module} from quick swap`, {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "dark",
    });
  };

  const handleClose = () => {
    DebugLogger("Handling close context menu");
    props.setContextMenu(null);
  };

  if (!props.contextMenu) return <></>;

  return (
    <Menu
      open={props.contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        props.contextMenu !== null
          ? { top: props.contextMenu.mouseY - 5, left: props.contextMenu.mouseX - 10 }
          : undefined
      }
      transitionDuration={{ enter: 0, exit: 0 }}
      MenuListProps={{ onMouseLeave: handleClose }}
      className="canvas-font"
    >
      <StyledMenuItem onClick={openNicknameModal}>Edit nickname</StyledMenuItem>
      <StyledMenuItem onClick={clearNickname}>Clear nickname</StyledMenuItem>
      <StyledDeleteMenuItem onClick={deleteQuickswap}>Delete</StyledDeleteMenuItem>
    </Menu>
  );
};

const StyledMenuItem = styled(MenuItem)`
  &:hover {
    background-color: #001529;
  }

  padding-left: 5px;

  margin-left: 5px;
  margin-right: 5px;
`;

const StyledDeleteMenuItem = styled(MenuItem)`
  color: #d82b2b !important;

  margin-left: 5px;
  margin-right: 5px;

  padding-left: 5px;

  &:hover {
    background-color: #001529;
    color: #960000 !important;
  }
`;

const StyledDisabledMenuItem = styled(MenuItem)`
  color: #ffffff4e;

  margin-left: 5px;
  margin-right: 5px;

  padding-left: 5px;

  cursor: not-allowed;
`;
