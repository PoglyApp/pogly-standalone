import { useContext, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import Permissions from "../../module_bindings/permissions";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DebugLogger } from "../../Utility/DebugLogger";
import Config from "../../module_bindings/config";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { MarkdownEditor } from "../General/MarkdownEditor";
import Markdown from "react-markdown";
import styled from "styled-components";
import UpdateEditorGuidelinesReducer from "../../module_bindings/update_editor_guidelines_reducer";

interface IProp {
    setAcceptedGuidelines?: Function;
  }

export const EditorGuidelineModal = (props: IProp) => {
    const isOverlay: Boolean = window.location.href.includes("/overlay");
    const config: Config = useContext(ConfigContext);
    const { modals, setModals, closeModal } = useContext(ModalContext);
    const { Identity } = useSpacetimeContext();
    const permission = Permissions.findByIdentity(Identity.identity)?.permissionLevel;
    const [guidelineText, setGuidelineText] = useState<string>(config.editorGuidelines.toString());
    const [error,setError] = useState<string>("");

    const initGuidelineAccept = () => {
        if(isOverlay) return true;
        if(permission && permission.tag === "Owner") return true;
        if(localStorage.getItem("Accept_EditorGuidelines")) return true;
        return false;
    };

    const [acceptedGuidelines,setAcceptedGuidelines] = useState<boolean>(initGuidelineAccept);

    const saveGuidelines = () => {
        if(permission && permission.tag !== "Owner") return;
        DebugLogger("Saved editor guidelines");
        UpdateEditorGuidelinesReducer.call(guidelineText);
        closeModal("guideline_modal", modals, setModals);
    };

    const handleTextChange = (newText: any) => {
        DebugLogger("Guideline text update");
        if (newText.length < 1) {
            DebugLogger("Guideline text too short");
            setGuidelineText("");
            return setError("Guideline text has to be at least 1 character long!");
        }

        setGuidelineText(newText);
        setError("");
    };

    const handleAccept = () => {
        DebugLogger("Accepting guidelines");
        localStorage.setItem("Accept_EditorGuidelines",new Date(Date.now()).toLocaleString());
        setAcceptedGuidelines(true);
        if(props.setAcceptedGuidelines) props.setAcceptedGuidelines(true);
        closeModal("guideline_modal", modals, setModals);
    };

    if (isOverlay) {
        DebugLogger("Editor guideline modal blocked from opening");
        return <></>;
    };

    DebugLogger("Editor guideline modal opened");

    return (
        <Dialog
            open={true}
            id="guidelineModal"
            onClose={() => {if(acceptedGuidelines) closeModal("guideline_modal", modals, setModals)}}
            sx={{
                ".MuiDialog-paper": {
                },
              }}
        >
            <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Editor Guidelines</DialogTitle>
            <DialogContent
                sx={{
                    backgroundColor: "#0a2a47",
                    paddingBottom: "3px",
                    paddingTop: "10px !important",
                    minWidth: "480px !important",
                }}
            >
            {permission && permission.tag === "Owner" ? 
            (
                <>
                    <StyledMarkdown>{guidelineText}</StyledMarkdown><br />
                    <MarkdownEditor text={guidelineText} setText={handleTextChange} />
                </>
            ) : 
            (
                <StyledMarkdown>{guidelineText}</StyledMarkdown>
            )}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px" }}>
                {permission && permission.tag==="Owner" && 
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={{
                            color: "#ffffffa6",
                            borderColor: "#ffffffa6",
                            "&:hover": { borderColor: "white" },
                        }}
                        onClick={saveGuidelines}
                    >
                        Save
                    </Button>
                }
                {acceptedGuidelines ? 
                (
                    <>
                    {permission?.tag !== "Owner" &&<DialogContentText sx={{ color: "#ffffffa6", }}>
                        {"Accepted on " + localStorage.getItem("Accept_EditorGuidelines")}
                    </DialogContentText>}
                    <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={{
                            color: "#ffffffa6",
                            borderColor: "#ffffffa6",
                            "&:hover": { borderColor: "white" },
                        }}
                        onClick={() => closeModal("guideline_modal", modals, setModals)}
                    >
                        Close
                    </Button>
                    </>
                    
                ) : 
                (
                    <Button
                        variant="outlined"
                        startIcon={<CheckCircleIcon />}
                        sx={{
                            color: "#ffffffa6",
                            borderColor: "#ffffffa6",
                            "&:hover": { borderColor: "white" },
                        }}
                        onClick={handleAccept}
                    >
                        Accept Guidelines
                    </Button>
                )}
                
            </DialogActions>
        </Dialog>
    );
};

const StyledMarkdown = styled(Markdown)`
    color: #ffffffa6 !important;
`;