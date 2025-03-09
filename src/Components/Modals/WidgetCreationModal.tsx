import { useCallback, useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  Button,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Link,
  Alert,
  Tooltip,
} from "@mui/material";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-cshtml";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/themes/prism-solarizedlight.css";
import { StyledInput } from "../StyledComponents/StyledInput";
import { ElementDataType } from "../../Types/General/ElementDataType";
import { insertElementData } from "../../StDB/Reducers/Insert/insertElementData";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ModalContext } from "../../Contexts/ModalContext";
import { WidgetVariableTable } from "../General/WidgetVariableTable";
import { updateElementData } from "../../StDB/Reducers/Update/updateElementData";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "styled-components";
import { WidgetExportModal } from "./WidgetExportModal";
import {
  StringifyWidgetCode,
  GetWidgetCodeJsonByElementDataID,
  StringifyRawDataWidgetCode,
} from "../../Utility/GetWidgetCodeJson";
import { WidgetVariableType } from "../../Types/General/WidgetVariableType";
import { updateElementStruct } from "../../StDB/Reducers/Update/updateElementStruct";
import { DebugLogger } from "../../Utility/DebugLogger";
import InfoOutlineIcon from "@mui/icons-material/InfoOutlined";
import { DataType, ElementStruct, PermissionLevel, WidgetElement } from "../../module_bindings";

const hightlightWithLineNumbers = (input: string, language: any, languageString: string) =>
  highlight(input, language, languageString)
    .split("\n")
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");

interface IProps {
  editElementDataId?: number;
  editElementId?: number;
}

export const WidgetCreationModal = (props: IProps) => {
  const { Identity, Client } = useSpacetimeContext();
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const [widgetName, setWidgetName] = useState<string>("");
  const [widgetWidth, setWidgetWidth] = useState<number>(128);
  const [widgetHeight, setWidgetHeight] = useState<number>(128);

  const [variables, setVariables] = useState<WidgetVariableType[]>([]);
  const [variablesKey, setVariablesKey] = useState<string>("variablesKey");

  const [headerCode, setHeaderCode] = useState<string>("");
  const [bodyCode, setBodyCode] = useState<string>("");
  const [styleCode, setStyleCode] = useState<string>("");
  const [scriptCode, setScriptCode] = useState<string>("");

  const [showModal, setShowModal] = useState<Boolean>(false);

  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const strictSettings: { StrictMode: boolean; Permission?: PermissionLevel } = {
    StrictMode: Client.db.config.version.find(0)!.strictMode,
    Permission: Client.db.permissions.identity.find(Identity.identity)?.permissionLevel,
  };

  const loadByElementDataID = useCallback(() => {
    if (!props.editElementDataId) return;

    try {
      DebugLogger("Loading widget by element data ID");
      const elementData = Client.db.elementData.id.find(props.editElementDataId);
      if (!elementData) return;

      const jsonObject = JSON.parse(elementData.data);

      setWidgetName(elementData.name);
      setWidgetWidth(elementData.dataWidth);
      setWidgetHeight(elementData.dataHeight);

      setHeaderCode(jsonObject.headerTag);
      setBodyCode(jsonObject.bodyTag);
      setStyleCode(jsonObject.styleTag);
      setScriptCode(jsonObject.scriptTag);
      setVariables(() => jsonObject.variables);

      setShowModal(true);
    } catch (error) {
      console.log("ERROR WHILE LOADING WIDGET BY ELEMENT DATA ID", error);
    }
  }, [props]);

  const loadByElementID = useCallback(() => {
    if (!props.editElementId) return;
    try {
      DebugLogger("Loading widget by element ID");

      const element = Client.db.elements.id.find(props.editElementId);
      if (!element) return;
      const widgetStruct: WidgetElement = element.element.value as WidgetElement;

      let widgetData: any = null;

      if (widgetStruct.rawData === "") widgetData = GetWidgetCodeJsonByElementDataID(Client, widgetStruct.elementDataId);
      else widgetData = JSON.parse(widgetStruct.rawData);

      setWidgetName(widgetData.widgetName || "");
      setWidgetWidth(widgetData.widgetWidth || "");
      setWidgetHeight(widgetData.widgetHeight || "");

      setHeaderCode(widgetData.headerTag || "");
      setBodyCode(widgetData.bodyTag || "");
      setStyleCode(widgetData.styleTag || "");
      setScriptCode(widgetData.scriptTag || "");
      setVariables(() => widgetData.variables || "");

      setShowModal(true);
    } catch (error) {
      console.log("ERROR WHILE LOADING WIDGET BY ELEMENT ID", error);
    }
  }, [props]);

  const loadByWidgetString = (widgetString: string) => {
    try {
      DebugLogger("Loading widget by widget string");
      const jsonObject = JSON.parse(widgetString);

      setWidgetName(jsonObject.widgetName || "");
      setWidgetWidth(jsonObject.widgetWidth || "");
      setWidgetHeight(jsonObject.widgetHeight || "");

      setHeaderCode(jsonObject.headerTag || "");
      setBodyCode(jsonObject.bodyTag || "");
      setStyleCode(jsonObject.styleTag || "");
      setScriptCode(jsonObject.scriptTag || "");
      if (jsonObject.variables && jsonObject.variables.length > 0) setVariables(() => jsonObject.variables);

      // A very stupid way to force the variabels component to re-render but fuck it
      setVariablesKey("variablesKey_updated");

      setShowModal(true);
    } catch (error) {
      console.log("ERROR WHILE LOADING WIDGET BY STRING", error);
    }
  };

  const handleOnClose = () => {
    DebugLogger("Closing widget modal");
    closeModal("widgetCreation_modal", modals, setModals);
  };

  const handleSave = () => {
    try {
      DebugLogger("Saving widget");
      if (props.editElementId) {
        const element = Client.db.elements.id.find(props.editElementId);
        if (!element) return;
        const widgetStruct: ElementStruct = element.element as ElementStruct;

        const widgetJson = StringifyRawDataWidgetCode(
          widgetName,
          widgetWidth,
          widgetHeight,
          headerCode,
          bodyCode,
          styleCode,
          scriptCode,
          variables
        );

        (widgetStruct.value as WidgetElement).rawData = widgetJson;

        updateElementStruct(Client, props.editElementId, widgetStruct);

        return handleOnClose();
      }

      const widgetJson = StringifyWidgetCode(headerCode, bodyCode, styleCode, scriptCode, variables);

      const newElementData: ElementDataType = {
        Name: widgetName,
        DataType: DataType.WidgetElement as DataType,
        Data: widgetJson,
        DataWidth: widgetWidth,
        DataHeight: widgetHeight,
        CreatedBy: Identity.nickname,
      };

      if (!props.editElementDataId) {
        insertElementData(Client, newElementData);
      } else {
        updateElementData(Client, props.editElementDataId, newElementData);
      }

      handleOnClose();
    } catch (error) {
      console.log("ERROR WHILE TRYING TO SAVE WIDGET", error);
    }
  };

  const openExportModal = () => {
    try {
      DebugLogger("Opening widget export modal");
      const widgetJson = StringifyRawDataWidgetCode(
        widgetName,
        widgetWidth,
        widgetHeight,
        headerCode,
        bodyCode,
        styleCode,
        scriptCode,
        variables
      );

      setModals((oldModals: any) => [
        ...oldModals,
        <WidgetExportModal key="widgetExport_modal" widgetString={widgetJson} />,
      ]);
    } catch (error) {
      console.log("ERROR WHILE OPENING WIDGET EXPORT MODAL", error);
    }
  };

  const openImportModal = () => {
    try {
      DebugLogger("Opening widget import modal");
      setModals((oldModals: any) => [
        ...oldModals,
        <WidgetExportModal key="widgetImport_modal" importing={true} loadByWidgetString={loadByWidgetString} />,
      ]);
    } catch (error) {
      console.log("ERROR WHILE OPENING WIDGET IMPORT MODAL", error);
    }
  };

  useEffect(() => {
    try {
      if (props.editElementDataId) return loadByElementDataID();
      if (props.editElementId) return loadByElementID();
      DebugLogger("Initializing widget creation modal");

      return setShowModal(true);
    } catch (error) {
      console.log("ERROR WHILE INITIALIZING WIDGET CREATION MODAL", error);
    }
  }, [props, loadByElementDataID, loadByElementID]);

  if (isOverlay) return <></>;

  return (
    <>
      {showModal && (
        <Dialog fullWidth={true} open={true} onClose={handleOnClose}>
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>
            {!props.editElementDataId && !props.editElementId && "Widget Creation"}
            {props.editElementDataId && !props.editElementId && "Edit Widget Data"}
            {!props.editElementDataId && props.editElementId && "Edit Widget Element"}

            {!props.editElementDataId && !props.editElementId && (
              <Typography color="#ffffffa6" fontSize={14}>
                Find community made widgets in{" "}
                <Link
                  href="https://discord.gg/pogly"
                  target="_blank"
                  rel="noreferrer"
                  underline="always"
                  sx={{ color: "#ffffffa6" }}
                >
                  Pogly Discord
                </Link>
                !
              </Typography>
            )}
          </DialogTitle>

          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            <FormGroup row style={{ gap: "20px", color: "#ffffffa6" }}>
              <StyledInput
                focused={true}
                label="Widget Name"
                color="#ffffffa6"
                onChange={(text: any) => setWidgetName(text)}
                value={widgetName}
              />

              {!props.editElementDataId && props.editElementId ? (
                <></>
              ) : (
                <>
                  <div style={{ maxWidth: "100px" }}>
                    <StyledInput
                      focused={false}
                      label="Width"
                      color="#ffffffa6"
                      onChange={(text: any) => setWidgetWidth(parseInt(text))}
                      defaultValue={widgetWidth ? widgetWidth.toString() : ""}
                    />
                  </div>
                  <div style={{ maxWidth: "100px" }}>
                    <StyledInput
                      focused={false}
                      label="Height"
                      color="#ffffffa6"
                      onChange={(text: any) => setWidgetHeight(parseInt(text))}
                      defaultValue={widgetHeight ? widgetHeight.toString() : ""}
                    />
                  </div>
                </>
              )}
            </FormGroup>

            <DialogContentText
              sx={{
                color: "#ffffffa6",
                marginTop: "20px",
                paddingBottom: "5px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {"Variables"}
              <Tooltip
                title={
                  <div>
                    <span>System variables:</span>
                    <br />
                    <strong>
                      {"{is_overlay}"}
                      <span> {" => If widget is currently in overlay."}</span>
                    </strong>
                    <br />
                    <strong>
                      {"{widget_width}"}
                      <span> {" => Widget width on spawn."}</span>
                    </strong>
                    <br />
                    <strong>
                      {"{widget_height}"}
                      <span> {" => Widget height on spawn."}</span>
                    </strong>
                  </div>
                }
              >
                <InfoOutlineIcon sx={{ fontSize: 16, paddingLeft: "5px" }} />
              </Tooltip>
            </DialogContentText>

            <WidgetVariableTable
              key={variablesKey}
              variables={variables}
              setVariables={setVariables}
              setError={setWidgetError}
            />

            {widgetError && (
              <Alert
                variant="filled"
                severity="warning"
                sx={{
                  backgroundColor: "#f57c00 !important",
                  color: "#212121",
                  marginBottom: "20px",
                }}
              >
                {widgetError}
              </Alert>
            )}

            <StyledAccordion>
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
                aria-controls="header-content"
                id="header-header"
                sx={{ color: "#ffffffa6" }}
              >
                {"<header>"}
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <StyledEditor
                  value={headerCode}
                  onValueChange={(code) => setHeaderCode(code)}
                  highlight={(code) => hightlightWithLineNumbers(code, languages.cshtml, "cshtml")}
                  padding={10}
                  textareaId="codeArea"
                  className="editor"
                />
              </StyledAccordionDetails>
            </StyledAccordion>

            <StyledAccordion>
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
                aria-controls="body-content"
                id="body-header"
                sx={{ color: "#ffffffa6" }}
              >
                {"<body>"}
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <StyledEditor
                  value={bodyCode}
                  onValueChange={(code) => setBodyCode(code)}
                  highlight={(code) => hightlightWithLineNumbers(code, languages.cshtml, "cshtml")}
                  padding={10}
                  textareaId="codeArea"
                  className="editor"
                />
              </StyledAccordionDetails>
            </StyledAccordion>

            <StyledAccordion>
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
                aria-controls="style-content"
                id="style-header"
                sx={{ color: "#ffffffa6" }}
              >
                {"<style>"}
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <StyledEditor
                  value={styleCode}
                  onValueChange={(code) => setStyleCode(code)}
                  highlight={(code) => hightlightWithLineNumbers(code, languages.css, "css")}
                  padding={10}
                  textareaId="codeArea"
                  className="editor"
                />
              </StyledAccordionDetails>
            </StyledAccordion>

            <StyledAccordion>
              <StyledAccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
                aria-controls="script-content"
                id="script-header"
                sx={{ color: "#ffffffa6" }}
              >
                {"<script>"}
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <StyledEditor
                  value={scriptCode}
                  onValueChange={(code) => {
                    if (code.includes("while")) {
                      setShowWarning(true);
                    } else {
                      setShowWarning(false);
                    }
                    setScriptCode(code);
                  }}
                  highlight={(code) => hightlightWithLineNumbers(code, languages.javascript, "javascript")}
                  padding={10}
                  textareaId="codeArea"
                  className="editor"
                />
              </StyledAccordionDetails>
            </StyledAccordion>

            {showWarning && (
              <Alert
                variant="filled"
                severity="warning"
                sx={{ backgroundColor: "#f57c00 !important", color: "#212121", marginTop: "20px" }}
              >
                WARNING! While loop detected, make sure you do NOT make a while loop that loops infinitely!
                <a
                  style={{ paddingLeft: "5px" }}
                  href="https://github.com/PoglyApp/pogly-documentation/blob/main/use/widgetElement.md#while-dont--"
                  target="_blank"
                  rel="noreferrer"
                >
                  Click here for more information
                </a>
              </Alert>
            )}
          </DialogContent>

          <DialogActions
            sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px", display: "grid" }}
          >
            <div style={{ position: "fixed" }}>
              <Button
                variant="outlined"
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  marginRight: "10px",
                }}
                onClick={openImportModal}
              >
                Import
              </Button>

              <Button
                variant="outlined"
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                }}
                onClick={openExportModal}
              >
                Export
              </Button>
            </div>

            <div>
              <Button
                variant="outlined"
                sx={{
                  color: "#ffffffa6",
                  borderColor: "#ffffffa6",
                  "&:hover": { borderColor: "white" },
                  marginRight: "10px",
                }}
                onClick={handleOnClose}
              >
                Cancel
              </Button>

              {strictSettings.StrictMode &&
              strictSettings.Permission?.tag !== "Owner" &&
              strictSettings.Permission?.tag !== "Moderator" ? (
                <></>
              ) : (
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
                  disabled={widgetError ? true : false}
                  onClick={handleSave}
                >
                  {props.editElementDataId || props.editElementId ? "Save" : "Create"}
                </Button>
              )}
            </div>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

const StyledAccordion = styled(Accordion)`
  padding-bottom: 0px;
`;

const StyledAccordionSummary = styled(AccordionSummary)`
  background-color: #05355f;
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  background-color: #032e53;
`;

const StyledEditor = styled(Editor)`
  font-family: "Fira code", "Fira Mono", monospace;
  font-size: 12px;
  outline: 0px;
  background-color: #1f1f1f;
  color: #9cdcfe;
  margin-top: 10px;
`;
