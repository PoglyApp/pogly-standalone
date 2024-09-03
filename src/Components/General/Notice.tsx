import { Alert, IconButton } from "@mui/material";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";
import { DebugLogger } from "../../Utility/DebugLogger";

interface IProps {
  noticeMessage: any;
  setNoticeMessage: Function;
}

export const Notice = (props: IProps) => {
  const handleNoticeClose = () => {
    DebugLogger("Handling close notice");
    props.setNoticeMessage(null);
    localStorage.setItem("notice_id", props.noticeMessage.noticeId);
  };

  return (
    <StyledAlert
      severity="warning"
      sx={{ ".MuiAlert-icon": { color: "#ffb13d" }, ".MuiAlert-message": { width: "100%", display: "flex" } }}
    >
      {props.noticeMessage.notice}
      <IconButton sx={{ padding: "0px", marginLeft: "auto" }} onClick={handleNoticeClose}>
        <CloseIcon sx={{ color: "#ffffffd9" }} />
      </IconButton>
    </StyledAlert>
  );
};

const StyledAlert = styled(Alert)`
  background-color: #c27707 !important;
  color: #ffffffd9 !important;

  border-style: solid;
  border-color: #a76707;
  border-radius: 0px !important;

  padding: 0 8px 0 8px;
  height: 40px;
  margin-left: 218px;
`;
