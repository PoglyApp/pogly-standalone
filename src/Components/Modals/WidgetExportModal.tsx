import { useContext, useState } from "react";
import { Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material";
import { StyledButton } from "../StyledComponents/StyledButton";
import { ModalContext } from "../../Contexts/ModalContext";
import { styled } from "styled-components";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { DebugLogger } from "../../Utility/DebugLogger";

interface IProps {
  widgetString?: string;
  importing?: boolean;
  loadByWidgetString?: Function;
}

export const WidgetExportModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const [copied, setCopied] = useState<boolean>(false);
  const [widgetCode, setWidgetCode] = useState<string>();
  const [error, setError] = useState<string>("");
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const handleOnClose = () => {
    closeModal(props.importing ? "widgetImport_modal" : "widgetExport_modal", modals, setModals);
  };

  const handleCopy = () => {
    if (!props.widgetString) return;
    try {
      DebugLogger("Copying widget code");

      navigator.clipboard.writeText(props.widgetString);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (error) {
      console.log("ERROR WHILE TRYING TO COPY WIDGET STRING", error);
    }
  };

  const handleImport = () => {
    try {
      DebugLogger("Importing widget code");
      if (props.loadByWidgetString && widgetCode) {
        try {
          JSON.parse(unescape(widgetCode));
          setError("");
        } catch (error) {
          return setError("Widget JSON does not parse.");
        }

        closeModal("widgetImport_modal", modals, setModals);

        props.loadByWidgetString(unescape(widgetCode));
      }
    } catch (error) {
      console.log("ERROR WHILE TRYING TO IMPORT WIDGET", error);
    }
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        {props.importing ? "Import" : "Export"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <DialogContentText sx={{ color: "#ffffffa6", textAlign: "left", paddingBottom: "8px" }}>
          Widget code
          {!props.importing && (
            <IconButton aria-label="delete" size="large" sx={{ padding: "0 0 0 10px" }} onClick={handleCopy}>
              {copied ? (
                <CheckIcon sx={{ fontSize: "16px", color: "green" }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: "16px", color: "#ffffffa6" }} />
              )}
            </IconButton>
          )}
        </DialogContentText>
        <StyledTextarea
          rows={4}
          cols={50}
          disabled={props.importing ? false : true}
          defaultValue={props.importing ? "" : props.widgetString}
          placeholder="Copy widget string here"
          onChange={(event: any) => setWidgetCode(event.target.value)}
        />

        {error !== "" && (
          <Alert severity="error" sx={{ typography: { color: "#e53e3e" } }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", textAlign: "center", display: "block" }}>
        <StyledButton
          disabled={false}
          label={props.importing ? "Cancel" : "Close"}
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleOnClose}
        />

        {props.importing && (
          <StyledButton
            disabled={false}
            label="Import"
            textColor="black"
            backgroundColor="#ffffffa6"
            hoverColor="white"
            onClick={handleImport}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

const StyledTextarea = styled.textarea`
  background-color: #0a2a47;
  color: #ffffffa6;
  border: 1px solid #ffffffa6;
  padding: 8px;

  &::placeholder {
    color: #ffffff81;
  }
`;
