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
} from "@mui/material";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-cshtml";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/themes/prism-solarizedlight.css";
import { StyledInput } from "../StyledComponents/StyledInput";
import { ElementDataType } from "../../Types/General/ElementDataType";
import DataType from "../../module_bindings/data_type";
import { insertElementData } from "../../StDB/Reducers/Insert/insertElementData";
import { IdentityContext } from "../../Contexts/IdentityContext";
import { ModalContext } from "../../Contexts/ModalContext";
import ElementData from "../../module_bindings/element_data";
import { WidgetVariableTable } from "../General/WidgetVariableTable";
import PermissionLevel from "../../module_bindings/permission_level";
import Permissions from "../../module_bindings/permissions";
import Config from "../../module_bindings/config";
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
import Elements from "../../module_bindings/elements";
import WidgetElement from "../../module_bindings/widget_element";
import ElementStruct from "../../module_bindings/element_struct";
import { updateElementStruct } from "../../StDB/Reducers/Update/updateElementStruct";

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
  const identityContext = useContext(IdentityContext);
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
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const strictSettings: { StrictMode: boolean; Permission?: PermissionLevel } = {
    StrictMode: Config.findByVersion(0)!.strictMode,
    Permission: Permissions.findByIdentity(identityContext.identity)?.permissionLevel,
  };

  const loadByElementDataID = useCallback(() => {
    const elementData = ElementData.findById(props.editElementDataId!);
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
  }, [props]);

  const loadByElementID = useCallback(() => {
    const element: Elements = Elements.findById(props.editElementId!)!;
    const widgetStruct: WidgetElement = element.element.value as WidgetElement;

    let widgetData: any = null;

    if (widgetStruct.rawData === "") widgetData = GetWidgetCodeJsonByElementDataID(widgetStruct.elementDataId);
    else widgetData = JSON.parse(widgetStruct.rawData);

    setWidgetName(widgetData.widgetName!);
    setWidgetWidth(widgetData.widgetWidth!);
    setWidgetHeight(widgetData.widgetHeight!);

    setHeaderCode(widgetData.headerTag);
    setBodyCode(widgetData.bodyTag);
    setStyleCode(widgetData.styleTag);
    setScriptCode(widgetData.scriptTag);
    setVariables(() => widgetData.variables);

    setShowModal(true);
  }, [props]);

  const loadByWidgetString = (widgetString: string) => {
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
  };

  const handleOnClose = () => {
    closeModal("widgetCreation_modal", modals, setModals);
  };

  const handleSave = () => {
    if (props.editElementId) {
      const element: Elements = Elements.findById(props.editElementId!)!;
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
      (widgetStruct.value as WidgetElement).elementDataId = -1;

      updateElementStruct(props.editElementId, widgetStruct);

      return handleOnClose();
    }

    const widgetJson = StringifyWidgetCode(headerCode, bodyCode, styleCode, scriptCode, variables);

    const newElementData: ElementDataType = {
      Name: widgetName,
      DataType: DataType.WidgetElement as DataType,
      Data: widgetJson,
      DataWidth: widgetWidth,
      DataHeight: widgetHeight,
      CreatedBy: identityContext.nickname,
    };

    if (!props.editElementDataId) {
      insertElementData(newElementData);
    } else {
      updateElementData(props.editElementDataId, newElementData);
    }

    handleOnClose();
  };

  const openExportModal = () => {
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
  };

  const openImportModal = () => {
    setModals((oldModals: any) => [
      ...oldModals,
      <WidgetExportModal key="widgetImport_modal" importing={true} loadByWidgetString={loadByWidgetString} />,
    ]);
  };

  useEffect(() => {
    if (props.editElementDataId) return loadByElementDataID();
    if (props.editElementId) return loadByElementID();

    return setShowModal(true);
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
                  href="https://discord.gg/uPQsBaVdB7"
                  target="_blank"
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

            <DialogContentText sx={{ color: "#ffffffa6", marginTop: "20px", paddingBottom: "5px" }}>
              {"Variables"}
            </DialogContentText>

            <WidgetVariableTable key={variablesKey} variables={variables} setVariables={setVariables} />

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
                  onValueChange={(code) => setScriptCode(code)}
                  highlight={(code) => hightlightWithLineNumbers(code, languages.javascript, "javascript")}
                  padding={10}
                  textareaId="codeArea"
                  className="editor"
                />
              </StyledAccordionDetails>
            </StyledAccordion>
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
